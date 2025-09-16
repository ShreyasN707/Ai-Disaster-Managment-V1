const express = require('express');
const multer = require('multer');
// const tf = require('@tensorflow/tfjs-node'); // Commented out due to installation issues
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Global variable to store the loaded model
let model = null;

// Load the TensorFlow.js model
async function loadModel() {
    try {
        console.log('Loading TensorFlow.js model...');
        const modelPath = path.join(__dirname, 'tfjs_model', 'model.json');
        
        if (!fs.existsSync(modelPath)) {
            console.log('Warning: TensorFlow.js model not found. Using mock model for demonstration.');
            console.log('To enable real inference, run train_and_export.py and install @tensorflow/tfjs-node');
            model = 'mock'; // Mock model for demonstration
            return;
        }
        
        // Uncomment when TensorFlow.js is properly installed
        // const tf = require('@tensorflow/tfjs-node');
        // model = await tf.loadLayersModel(`file://${modelPath}`);
        // console.log('Model loaded successfully!');
        // console.log('Model input shape:', model.inputs[0].shape);
        // console.log('Model output shape:', model.outputs[0].shape);
        
        console.log('TensorFlow.js not available. Using mock model.');
        model = 'mock';
    } catch (error) {
        console.error('Error loading model:', error);
        console.log('Using mock model for demonstration.');
        model = 'mock';
    }
}

// Preprocess image for model input
async function preprocessImage(imageBuffer) {
    try {
        // Use sharp to resize and normalize the image
        const processedImage = await sharp(imageBuffer)
            .resize(128, 128) // Resize to model input size
            .removeAlpha() // Remove alpha channel if present
            .raw() // Get raw pixel data
            .toBuffer();
        
        // For mock model, just return the processed image buffer
        // In real implementation, this would convert to TensorFlow tensors
        return processedImage;
    } catch (error) {
        console.error('Error preprocessing image:', error);
        throw error;
    }
}

// Postprocess prediction to create binary mask
function postprocessPrediction(prediction) {
    try {
        // For mock model, create a simple pattern
        if (model === 'mock') {
            const maskArray = new Array(128 * 128).fill(0).map((_, i) => {
                const x = i % 128;
                const y = Math.floor(i / 128);
                // Create a simple pattern for demonstration
                return (Math.sin(x * 0.1) * Math.cos(y * 0.1) > 0.3) ? 1 : 0;
            });
            return { maskArray, maskShape: [128, 128] };
        }
        
        // Real implementation would use TensorFlow tensors
        // const binaryMask = prediction.greater(0.5).cast('float32');
        // const mask2D = binaryMask.squeeze();
        // const maskArray = mask2D.dataSync();
        // const maskShape = mask2D.shape;
        // return { maskArray, maskShape };
        
        return { maskArray: [], maskShape: [128, 128] };
    } catch (error) {
        console.error('Error postprocessing prediction:', error);
        throw error;
    }
}

// Convert mask array to PNG buffer
async function maskToPng(maskArray, maskShape) {
    try {
        // Create a 3-channel image (grayscale)
        const imageData = Buffer.alloc(maskShape[0] * maskShape[1] * 3);
        
        for (let i = 0; i < maskArray.length; i++) {
            const pixelValue = Math.round(maskArray[i] * 255);
            const baseIndex = i * 3;
            imageData[baseIndex] = pixelValue;     // R
            imageData[baseIndex + 1] = pixelValue; // G
            imageData[baseIndex + 2] = pixelValue; // B
        }
        
        // Convert to PNG using sharp
        const pngBuffer = await sharp(imageData, {
            raw: {
                width: maskShape[1],
                height: maskShape[0],
                channels: 3
            }
        }).png().toBuffer();
        
        return pngBuffer;
    } catch (error) {
        console.error('Error converting mask to PNG:', error);
        throw error;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        model_loaded: model !== null,
        timestamp: new Date().toISOString()
    });
});

// Main prediction endpoint
app.post('/predict', upload.single('image'), async (req, res) => {
    try {
        if (!model) {
            return res.status(500).json({ 
                error: 'Model not loaded. Please check server logs.' 
            });
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                error: 'No image file provided. Please upload an image.' 
            });
        }
        
        console.log(`Processing image: ${req.file.originalname}, size: ${req.file.size} bytes`);
        
        // Preprocess the uploaded image
        const inputTensor = await preprocessImage(req.file.buffer);
        
        // Run prediction
        console.log('Running prediction...');
        let prediction;
        
        if (model === 'mock') {
            // Mock prediction for demonstration
            prediction = 'mock_prediction';
        } else {
            // Real prediction would use TensorFlow
            // prediction = model.predict(inputTensor);
            prediction = 'mock_prediction';
        }
        
        // Postprocess prediction
        const { maskArray, maskShape } = postprocessPrediction(prediction);
        
        // Convert mask to PNG
        const maskPng = await maskToPng(maskArray, maskShape);
        
        // Clean up tensors to prevent memory leaks (when using real model)
        // inputTensor.dispose();
        // prediction.dispose();
        
        console.log('Prediction completed successfully');
        
        // Return the mask as PNG image
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': maskPng.length,
            'X-Prediction-Shape': `${maskShape[0]}x${maskShape[1]}`,
            'X-Processing-Time': Date.now() - req.startTime
        });
        
        res.send(maskPng);
        
    } catch (error) {
        console.error('Prediction error:', error);
        res.status(500).json({ 
            error: 'Prediction failed', 
            message: error.message 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File too large. Maximum size is 10MB.' 
            });
        }
    }
    
    console.error('Server error:', error);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
    });
});

// Middleware to track request timing
app.use((req, res, next) => {
    req.startTime = Date.now();
    next();
});

// Start server
async function startServer() {
    try {
        // Load the model first
        await loadModel();
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Landslide Prediction Server running on port ${PORT}`);
            console.log(`📡 Health check: http://localhost:${PORT}/health`);
            console.log(`🔮 Prediction endpoint: POST http://localhost:${PORT}/predict`);
            console.log(`📁 Upload an image file with key 'image' to get landslide prediction mask`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down server...');
    process.exit(0);
});

// Start the server
startServer();
