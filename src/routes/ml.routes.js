const router = require('express').Router();
const multer = require('multer');
const { predictLandslide, getRiskPrediction, getRiskOverlay, getMLStatus } = require('../services/mlService');
const auth = require('../middlewares/auth');
const logger = require('../utils/logger');

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

/**
 * @route GET /api/ml/status
 * @desc Get ML service status
 * @access Public
 */
router.get('/status', async (req, res) => {
    try {
        const status = getMLStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        logger.error('ML status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get ML service status',
            error: error.message
        });
    }
});

/**
 * @route POST /api/ml/predict/landslide
 * @desc Predict landslide risk from satellite image
 * @access Protected (Operator/Admin)
 */
router.post('/predict/landslide', auth, upload.single('image'), async (req, res) => {
    try {
        // Check if user has operator or admin role
        if (!['operator', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Operator or Admin role required.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided. Please upload a satellite image.'
            });
        }

        logger.info(`Processing landslide prediction for user: ${req.user.id}, file: ${req.file.originalname}`);

        const startTime = Date.now();
        const result = await predictLandslide(req.file.buffer);
        const processingTime = Date.now() - startTime;

        // Return the mask as PNG image with metadata headers
        res.set({
            'Content-Type': 'image/png',
            'Content-Length': result.maskImage.length,
            'X-Risk-Level': result.riskLevel,
            'X-Risk-Percentage': result.riskPercentage,
            'X-Mask-Shape': `${result.maskShape[0]}x${result.maskShape[1]}`,
            'X-Processing-Time': processingTime.toString(),
            'X-Model-Type': result.metadata.modelType
        });

        res.send(result.maskImage);

    } catch (error) {
        logger.error('Landslide prediction error:', error);
        res.status(500).json({
            success: false,
            message: 'Landslide prediction failed',
            error: error.message
        });
    }
});

/**
 * @route POST /api/ml/predict/landslide/json
 * @desc Predict landslide risk from satellite image (JSON response)
 * @access Protected (Operator/Admin)
 */
router.post('/predict/landslide/json', auth, upload.single('image'), async (req, res) => {
    try {
        // Check if user has operator or admin role
        if (!['operator', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Operator or Admin role required.'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided. Please upload a satellite image.'
            });
        }

        logger.info(`Processing landslide prediction (JSON) for user: ${req.user.id}, file: ${req.file.originalname}`);

        const startTime = Date.now();
        const result = await predictLandslide(req.file.buffer);
        const processingTime = Date.now() - startTime;

        // Convert mask image to base64 for JSON response
        const maskBase64 = result.maskImage.toString('base64');

        res.json({
            success: true,
            data: {
                riskLevel: result.riskLevel,
                riskPercentage: result.riskPercentage,
                maskShape: result.maskShape,
                maskImage: `data:image/png;base64,${maskBase64}`,
                metadata: {
                    ...result.metadata,
                    processingTime,
                    originalFilename: req.file.originalname,
                    fileSize: req.file.size
                }
            }
        });

    } catch (error) {
        logger.error('Landslide prediction (JSON) error:', error);
        res.status(500).json({
            success: false,
            message: 'Landslide prediction failed',
            error: error.message
        });
    }
});

/**
 * @route GET /api/ml/risk/prediction
 * @desc Get risk prediction based on sensor data
 * @access Protected (Operator/Admin)
 */
router.get('/risk/prediction', auth, async (req, res) => {
    try {
        // Check if user has operator or admin role
        if (!['operator', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Operator or Admin role required.'
            });
        }

        // Get sensor data from query params or database
        // For now, we'll use mock data - in real implementation, fetch from sensors collection
        const mockSensorData = [
            { status: 'online', health: 'good', lastReading: { value: 75 }, threshold: 80 },
            { status: 'offline', health: 'critical', lastReading: { value: 95 }, threshold: 80 },
            { status: 'online', health: 'warning', lastReading: { value: 85 }, threshold: 80 }
        ];

        const prediction = await getRiskPrediction(mockSensorData);

        res.json({
            success: true,
            data: prediction
        });

    } catch (error) {
        logger.error('Risk prediction error:', error);
        res.status(500).json({
            success: false,
            message: 'Risk prediction failed',
            error: error.message
        });
    }
});

/**
 * @route GET /api/ml/risk/overlay
 * @desc Get GeoJSON risk overlay for map visualization
 * @access Protected (Operator/Admin)
 */
router.get('/risk/overlay', auth, async (req, res) => {
    try {
        // Check if user has operator or admin role
        if (!['operator', 'admin'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Operator or Admin role required.'
            });
        }

        const { bounds } = req.query;
        
        // Get sensor data from query params or database
        // For now, we'll use mock data - in real implementation, fetch from sensors collection
        const mockSensorData = [
            { 
                _id: '1', 
                name: 'Sensor 1', 
                status: 'online', 
                health: 'good',
                location: { coordinates: [-122.4194, 37.7749] }
            },
            { 
                _id: '2', 
                name: 'Sensor 2', 
                status: 'offline', 
                health: 'critical',
                location: { coordinates: [-122.4094, 37.7849] }
            }
        ];

        const overlay = await getRiskOverlay(bounds ? JSON.parse(bounds) : null, mockSensorData);

        res.json({
            success: true,
            data: overlay
        });

    } catch (error) {
        logger.error('Risk overlay error:', error);
        res.status(500).json({
            success: false,
            message: 'Risk overlay generation failed',
            error: error.message
        });
    }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File too large. Maximum size is 10MB.'
            });
        }
    }
    
    logger.error('ML route error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
    });
});

module.exports = router;
