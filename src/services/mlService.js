const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const config = require('../config');
const logger = require('../utils/logger');

// Global variable to store the loaded model
let model = null;
let modelLoaded = false;

/**
 * Load the TensorFlow.js model for landslide prediction
 */
async function loadModel() {
  try {
    if (!config.ML_SERVICE.ENABLED) {
      logger.info('ML service disabled in configuration');
      model = 'disabled';
      return;
    }

    // Force use of mock model for now
    if (config.ML_SERVICE.USE_MOCK_MODEL) {
      logger.info('Using mock ML model as configured');
      model = 'mock';
      modelLoaded = true;
      return;
    }

    logger.info('Loading TensorFlow.js model...');
    const modelPath = path.join(process.cwd(), config.ML_SERVICE.MODEL_PATH, 'model.json');
    
    if (!fs.existsSync(modelPath)) {
      logger.warn('TensorFlow.js model not found. Using mock model for demonstration.');
      logger.warn('To enable real inference, run train_and_export.py and install @tensorflow/tfjs-node');
      model = 'mock';
      modelLoaded = true;
      return;
    }
    
    try {
      // Try to load TensorFlow.js
      const tf = require('@tensorflow/tfjs-node');
      model = await tf.loadLayersModel(`file://${modelPath}`);
      logger.info('Model loaded successfully!');
      logger.info(`Model input shape: ${model.inputs[0].shape}`);
      logger.info(`Model output shape: ${model.outputs[0].shape}`);
      modelLoaded = true;
    } catch (tfError) {
      logger.warn('TensorFlow.js not available. Using mock model.');
      logger.warn('Install @tensorflow/tfjs-node for real ML predictions');
      model = 'mock';
      modelLoaded = true;
    }
  } catch (error) {
    logger.error('Error loading model:', error);
    logger.info('Using mock model for demonstration.');
    model = 'mock';
    modelLoaded = true;
  }
}

/**
 * Preprocess image for model input
 * @param {Buffer} imageBuffer - Raw image buffer
 * @returns {Buffer|Tensor} Processed image data
 */
async function preprocessImage(imageBuffer) {
  try {
    // Use sharp to resize and normalize the image
    const processedImage = await sharp(imageBuffer)
      .resize(128, 128) // Resize to model input size
      .removeAlpha() // Remove alpha channel if present
      .raw() // Get raw pixel data
      .toBuffer();
    
    return processedImage;
  } catch (error) {
    logger.error('Error preprocessing image:', error);
    throw error;
  }
}

/**
 * Postprocess prediction to create binary mask
 * @param {*} prediction - Model prediction output
 * @returns {Object} Processed mask data
 */
function postprocessPrediction(prediction) {
  try {
    // For mock model, create a simple pattern
    if (model === 'mock' || model === 'disabled') {
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
    logger.error('Error postprocessing prediction:', error);
    throw error;
  }
}

/**
 * Convert mask array to PNG buffer
 * @param {Array} maskArray - Binary mask array
 * @param {Array} maskShape - Shape of the mask [height, width]
 * @returns {Buffer} PNG image buffer
 */
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
    logger.error('Error converting mask to PNG:', error);
    throw error;
  }
}

/**
 * Predict landslide risk from satellite image
 * @param {Buffer} imageBuffer - Satellite image buffer
 * @returns {Object} Prediction result with mask and metadata
 */
async function predictLandslide(imageBuffer) {
  try {
    if (!modelLoaded) {
      await loadModel();
    }

    if (!model || model === 'disabled') {
      throw new Error('ML model not available');
    }
    
    logger.info('Processing landslide prediction...');
    
    // Preprocess the uploaded image
    const inputTensor = await preprocessImage(imageBuffer);
    
    // Run prediction
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
    
    // Calculate risk metrics
    const totalPixels = maskArray.length;
    const riskPixels = maskArray.filter(pixel => pixel > 0.5).length;
    const riskPercentage = (riskPixels / totalPixels) * 100;
    
    let riskLevel = 'low';
    if (riskPercentage >= 30) riskLevel = 'critical';
    else if (riskPercentage >= 20) riskLevel = 'high';
    else if (riskPercentage >= 10) riskLevel = 'medium';
    
    logger.info('Landslide prediction completed successfully');
    
    return {
      maskImage: maskPng,
      riskLevel,
      riskPercentage: riskPercentage.toFixed(2),
      maskShape,
      metadata: {
        modelType: model === 'mock' ? 'mock' : 'tensorflow',
        processingTime: Date.now(),
        imageSize: imageBuffer.length
      }
    };
    
  } catch (error) {
    logger.error('Landslide prediction error:', error);
    throw error;
  }
}

/**
 * Calculate risk prediction based on sensor data
 * @param {Array} sensorData - Array of sensor readings
 * @returns {Object} Risk level and score
 */
async function getRiskPrediction(sensorData = []) {
  try {
    // Enhanced heuristic: consider sensor status, health, and readings
    let score = 0.1; // Base risk
    const total = sensorData.length || 1;
    
    const offline = sensorData.filter((s) => s.status === 'offline').length;
    const critical = sensorData.filter((s) => s.health === 'critical').length;
    const warning = sensorData.filter((s) => s.health === 'warning').length;
    
    // Calculate risk based on sensor conditions
    score += (offline / total) * 0.4; // Offline sensors increase risk
    score += (critical / total) * 0.3; // Critical health increases risk
    score += (warning / total) * 0.15; // Warning health slightly increases risk
    
    // Consider recent readings if available
    const recentHighReadings = sensorData.filter(s => 
      s.lastReading && s.lastReading.value > (s.threshold || 80)
    ).length;
    score += (recentHighReadings / total) * 0.15;
    
    score = Math.min(1, score);
    
    let level = 'low';
    if (score >= 0.8) level = 'critical';
    else if (score >= 0.6) level = 'high';
    else if (score >= 0.4) level = 'medium';

    return { 
      level, 
      score: parseFloat(score.toFixed(3)),
      factors: {
        offline,
        critical,
        warning,
        total,
        recentHighReadings
      }
    };
  } catch (error) {
    logger.error('Error calculating risk prediction:', error);
    throw error;
  }
}

/**
 * Generate GeoJSON overlay for map visualization
 * @param {Object} bounds - Optional map bounds for filtering
 * @param {Array} sensorData - Sensor data for risk calculation
 * @returns {Object} GeoJSON feature collection
 */
async function getRiskOverlay(bounds = null, sensorData = []) {
  try {
    const features = [];
    
    // Generate risk zones based on sensor data
    if (sensorData && sensorData.length > 0) {
      sensorData.forEach(sensor => {
        if (sensor.location && sensor.location.coordinates) {
          const [lng, lat] = sensor.location.coordinates;
          
          // Create a circular risk zone around each sensor
          const radius = 0.01; // Approximately 1km
          const points = 16;
          const coordinates = [];
          
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * 2 * Math.PI;
            const x = lng + radius * Math.cos(angle);
            const y = lat + radius * Math.sin(angle);
            coordinates.push([x, y]);
          }
          
          let riskLevel = 'low';
          if (sensor.status === 'offline') riskLevel = 'high';
          else if (sensor.health === 'critical') riskLevel = 'critical';
          else if (sensor.health === 'warning') riskLevel = 'medium';
          
          features.push({
            type: 'Feature',
            properties: { 
              risk: riskLevel,
              sensorId: sensor._id || sensor.id,
              sensorName: sensor.name,
              status: sensor.status,
              health: sensor.health
            },
            geometry: { 
              type: 'Polygon', 
              coordinates: [coordinates] 
            },
          });
        }
      });
    } else {
      // Default demo overlay
      features.push({
        type: 'Feature',
        properties: { risk: 'medium', demo: true },
        geometry: { 
          type: 'Polygon', 
          coordinates: [[[0, 0],[0, 1],[1, 1],[1, 0],[0, 0]]] 
        },
      });
    }
    
    return {
      type: 'FeatureCollection',
      features,
      metadata: {
        generated: new Date().toISOString(),
        sensorCount: sensorData.length,
        bounds
      }
    };
  } catch (error) {
    logger.error('Error generating risk overlay:', error);
    throw error;
  }
}

/**
 * Get ML service status
 * @returns {Object} Service status information
 */
function getMLStatus() {
  return {
    enabled: config.ML_SERVICE.ENABLED,
    modelLoaded,
    modelType: model === 'mock' ? 'mock' : model === 'disabled' ? 'disabled' : 'tensorflow',
    modelPath: config.ML_SERVICE.MODEL_PATH,
    useMockModel: config.ML_SERVICE.USE_MOCK_MODEL,
    timestamp: new Date().toISOString()
  };
}

// Initialize model on service load
if (config.ML_SERVICE.ENABLED) {
  loadModel().catch(error => {
    logger.error('Failed to initialize ML model:', error);
  });
}

module.exports = { 
  getRiskPrediction, 
  getRiskOverlay, 
  predictLandslide,
  getMLStatus,
  loadModel
};
