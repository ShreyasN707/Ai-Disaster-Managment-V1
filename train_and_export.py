#!/usr/bin/env python3
"""
Landslide Prediction Model Training and Export
Trains a U-Net model on satellite images and exports to TensorFlow.js format
"""

import os
import h5py
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.model_selection import train_test_split
# import tensorflowjs as tfjs  # Commented out for now due to dependency issues
from pathlib import Path
import argparse

# Set random seeds for reproducibility
tf.random.set_seed(42)
np.random.seed(42)

class DataLoader:
    """Data loader for H5 files containing satellite images and masks"""
    
    def __init__(self, data_dir, img_size=(128, 128)):
        self.data_dir = Path(data_dir)
        self.img_size = img_size
        self.train_img_dir = self.data_dir / "TrainData" / "img"
        self.train_mask_dir = self.data_dir / "TrainData" / "mask"
        self.test_img_dir = self.data_dir / "TestData" / "img"
        self.test_mask_dir = self.data_dir / "TestData" / "mask"
    
    def load_h5_data(self, img_dir, mask_dir, max_samples=None):
        """Load images and masks from H5 files"""
        img_files = sorted([f for f in img_dir.glob("*.h5")])
        mask_files = sorted([f for f in mask_dir.glob("*.h5")])
        
        if max_samples:
            img_files = img_files[:max_samples]
            mask_files = mask_files[:max_samples]
        
        images = []
        masks = []
        
        print(f"Loading {len(img_files)} image-mask pairs...")
        
        for i, (img_file, mask_file) in enumerate(zip(img_files, mask_files)):
            if i % 100 == 0:
                print(f"Processed {i}/{len(img_files)} files")
            
            # Load image
            with h5py.File(img_file, 'r') as f:
                img = f['img'][:]
            
            # Load mask
            with h5py.File(mask_file, 'r') as f:
                mask = f['mask'][:]
            
            # Ensure correct shape
            if img.shape[:2] != self.img_size:
                img = tf.image.resize(img, self.img_size).numpy()
            if mask.shape != self.img_size:
                mask = tf.image.resize(mask[..., np.newaxis], self.img_size).numpy()[..., 0]
            
            images.append(img)
            masks.append(mask)
        
        return np.array(images), np.array(masks)
    
    def normalize_data(self, images, masks):
        """Normalize images and ensure masks are binary"""
        # Normalize images to [0, 1]
        images = images.astype(np.float32)
        images = (images - images.min()) / (images.max() - images.min())
        
        # Ensure masks are binary (0 or 1)
        masks = masks.astype(np.float32)
        masks = (masks > 0.5).astype(np.float32)
        
        return images, masks

def create_unet_model(input_shape, num_classes=1):
    """Create U-Net model for semantic segmentation"""
    
    def conv_block(inputs, filters, kernel_size=3, padding='same', activation='relu'):
        x = layers.Conv2D(filters, kernel_size, padding=padding)(inputs)
        x = layers.BatchNormalization()(x)
        x = layers.Activation(activation)(x)
        return x
    
    def encoder_block(inputs, filters):
        x = conv_block(inputs, filters)
        x = conv_block(x, filters)
        skip = x
        x = layers.MaxPooling2D(2)(x)
        return x, skip
    
    def decoder_block(inputs, skip, filters):
        x = layers.Conv2DTranspose(filters, 2, strides=2, padding='same')(inputs)
        x = layers.Concatenate()([x, skip])
        x = conv_block(x, filters)
        x = conv_block(x, filters)
        return x
    
    # Input
    inputs = layers.Input(shape=input_shape)
    
    # Encoder
    e1, s1 = encoder_block(inputs, 64)
    e2, s2 = encoder_block(e1, 128)
    e3, s3 = encoder_block(e2, 256)
    e4, s4 = encoder_block(e3, 512)
    
    # Bottleneck
    b = conv_block(e4, 1024)
    b = conv_block(b, 1024)
    
    # Decoder
    d4 = decoder_block(b, s4, 512)
    d3 = decoder_block(d4, s3, 256)
    d2 = decoder_block(d3, s2, 128)
    d1 = decoder_block(d2, s1, 64)
    
    # Output
    outputs = layers.Conv2D(num_classes, 1, activation='sigmoid')(d1)
    
    model = keras.Model(inputs, outputs, name='unet_landslide')
    return model

def dice_coefficient(y_true, y_pred, smooth=1e-6):
    """Dice coefficient for segmentation evaluation"""
    y_true_f = tf.keras.backend.flatten(y_true)
    y_pred_f = tf.keras.backend.flatten(y_pred)
    intersection = tf.keras.backend.sum(y_true_f * y_pred_f)
    return (2. * intersection + smooth) / (tf.keras.backend.sum(y_true_f) + tf.keras.backend.sum(y_pred_f) + smooth)

def dice_loss(y_true, y_pred):
    """Dice loss for segmentation"""
    return 1 - dice_coefficient(y_true, y_pred)

def combined_loss(y_true, y_pred):
    """Combined binary crossentropy and dice loss"""
    bce = tf.keras.losses.binary_crossentropy(y_true, y_pred)
    dice = dice_loss(y_true, y_pred)
    return bce + dice

def train_model():
    """Main training function"""
    
    # Configuration
    IMG_SIZE = (128, 128)
    BATCH_SIZE = 16
    EPOCHS = 50
    LEARNING_RATE = 1e-4
    
    # Data paths
    data_dir = Path("data")
    
    # Initialize data loader
    data_loader = DataLoader(data_dir, IMG_SIZE)
    
    print("Loading training data...")
    train_images, train_masks = data_loader.load_h5_data(
        data_loader.train_img_dir, 
        data_loader.train_mask_dir,
        max_samples=1000  # Limit for faster training
    )
    
    print("Loading test data...")
    test_images, test_masks = data_loader.load_h5_data(
        data_loader.test_img_dir, 
        data_loader.test_mask_dir,
        max_samples=200  # Limit for faster training
    )
    
    print(f"Training data shape: {train_images.shape}, {train_masks.shape}")
    print(f"Test data shape: {test_images.shape}, {test_masks.shape}")
    
    # Normalize data
    train_images, train_masks = data_loader.normalize_data(train_images, train_masks)
    test_images, test_masks = data_loader.normalize_data(test_images, test_masks)
    
    # Add channel dimension to masks
    train_masks = train_masks[..., np.newaxis]
    test_masks = test_masks[..., np.newaxis]
    
    # Split training data into train/validation
    train_images, val_images, train_masks, val_masks = train_test_split(
        train_images, train_masks, test_size=0.2, random_state=42
    )
    
    print(f"Final training set: {train_images.shape}")
    print(f"Validation set: {val_images.shape}")
    print(f"Test set: {test_images.shape}")
    
    # Create model
    input_shape = train_images.shape[1:]
    model = create_unet_model(input_shape)
    
    # Compile model
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=LEARNING_RATE),
        loss=combined_loss,
        metrics=['accuracy', dice_coefficient]
    )
    
    print(f"Model created with {model.count_params():,} parameters")
    model.summary()
    
    # Callbacks
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_dice_coefficient',
            patience=10,
            restore_best_weights=True,
            mode='max'
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.5,
            patience=5,
            min_lr=1e-7
        ),
        keras.callbacks.ModelCheckpoint(
            'best_model.h5',
            monitor='val_dice_coefficient',
            save_best_only=True,
            mode='max'
        )
    ]
    
    # Train model
    print("Starting training...")
    history = model.fit(
        train_images, train_masks,
        validation_data=(val_images, val_masks),
        batch_size=BATCH_SIZE,
        epochs=EPOCHS,
        callbacks=callbacks,
        verbose=1
    )
    
    # Evaluate on test set
    print("Evaluating on test set...")
    test_loss, test_acc, test_dice = model.evaluate(test_images, test_masks, verbose=0)
    print(f"Test Loss: {test_loss:.4f}")
    print(f"Test Accuracy: {test_acc:.4f}")
    print(f"Test Dice Coefficient: {test_dice:.4f}")
    
    # Save model in TensorFlow SavedModel format
    print("Saving model in SavedModel format...")
    model.save('landslide_model')
    
    # Convert to TensorFlow.js format
    print("Converting to TensorFlow.js format...")
    try:
        import tensorflowjs as tfjs
        tfjs.converters.save_keras_model(model, 'tfjs_model')
        print("TensorFlow.js model saved successfully!")
    except ImportError:
        print("Warning: tensorflowjs not available. Skipping TensorFlow.js conversion.")
        print("To enable TensorFlow.js conversion, install tensorflowjs:")
        print("pip install tensorflowjs")
    
    print("Training completed successfully!")
    print("Files saved:")
    print("- landslide_model/ (TensorFlow SavedModel)")
    print("- tfjs_model/ (TensorFlow.js format)")
    print("- best_model.h5 (Best weights)")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Train landslide prediction model')
    parser.add_argument('--data-dir', default='data', help='Path to data directory')
    parser.add_argument('--epochs', type=int, default=50, help='Number of training epochs')
    parser.add_argument('--batch-size', type=int, default=16, help='Batch size')
    args = parser.parse_args()
    
    # Set data directory
    if args.data_dir != 'data':
        os.environ['DATA_DIR'] = args.data_dir
    
    train_model()
