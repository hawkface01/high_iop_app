import { Asset } from 'expo-asset';
import { loadTensorflowModel, TensorflowModel } from 'react-native-fast-tflite';
import * as FileSystem from 'expo-file-system';
// You will likely need image manipulation libraries
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'; // Example using expo-image-manipulator
// Or: import ImageResizer from 'react-native-image-resizer';
// Import JPEG decoder and Buffer
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer'; // For base64 decoding

// --- Model Configuration (UPDATED FOR MOBILENETV2) ---
const MODEL_INPUT_SHAPE = { height: 224, width: 224, channels: 3 };
// Normalization for MobileNetV2 (scales pixels from [0, 255] to [-1, 1])
const normalizePixelMobileNetV2 = (pixelValue: number): number => {
    return (pixelValue - 127.5) / 127.5;
};

let model: TensorflowModel | null = null;
let modelLoadingPromise: Promise<TensorflowModel | null> | null = null;

// --- Model Loading (Should now load the smaller model faster) ---
const loadModel = async (): Promise<TensorflowModel | null> => {
    if (model) {
        return model;
    }
    if (modelLoadingPromise) {
        return modelLoadingPromise;
    }

    modelLoadingPromise = (async () => {
        try {
            console.log('Attempting to load MobileNetV2 model directly using require...');
            // Ensure this require points to the new model file
            const modelRequire = require('../assets/ml_model/model.tflite');

            // Load the model using the require result
            const loadedModel = await loadTensorflowModel(modelRequire);

            console.log('MobileNetV2 Model loaded successfully!');
            model = loadedModel;
            return model;
        } catch (error) {
            console.error('Error loading MobileNetV2 TFLite model:', error);
            if (error instanceof Error) {
                console.error('Error details:', error.message, error.stack);
            }
            modelLoadingPromise = null;
            model = null;
            return null;
        }
    })();

    return modelLoadingPromise;
};


// --- Preprocessing (UPDATED FOR MOBILENETV2) ---
// This STILL requires a proper implementation for getting raw pixel data!
const preprocessImageToTensor = async (imageUri: string): Promise<Float32Array | null> => {
  try {
    console.log('Preprocessing image for MobileNetV2:', imageUri);

    // 1. Resize the image to the correct input shape (224x224)
    // Request JPEG format specifically for the decoder
    const resizedImage = await manipulateAsync(
      imageUri,
      [{ resize: { width: MODEL_INPUT_SHAPE.width, height: MODEL_INPUT_SHAPE.height } }],
      { compress: 1, format: SaveFormat.JPEG } // Ensure JPEG format
    );
    console.log('Image resized to:', resizedImage.uri, `(${resizedImage.width}x${resizedImage.height})`);

    // 2. Read the resized image file as base64
    const imgB64 = await FileSystem.readAsStringAsync(resizedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    console.log('Image read as base64 string (length check)');

    // 3. Decode base64 to buffer
    const imgBuffer = Buffer.from(imgB64, 'base64');
    console.log('Base64 decoded to buffer');

    // 4. Decode JPEG buffer to raw pixel data
    // useTArray uses Uint8Array, which is efficient
    const rawImageData = jpeg.decode(imgBuffer, { useTArray: true });
    console.log('JPEG decoded. Raw data dims:', rawImageData.width, rawImageData.height);

    // Sanity check dimensions (optional)
    if (rawImageData.width !== MODEL_INPUT_SHAPE.width || rawImageData.height !== MODEL_INPUT_SHAPE.height) {
        console.warn(`Decoded image dimensions (${rawImageData.width}x${rawImageData.height}) don't match model input (${MODEL_INPUT_SHAPE.width}x${MODEL_INPUT_SHAPE.height}). This might be unexpected.`);
        // You could add resizing here again if manipulateAsync wasn't reliable, but it should be.
    }

    // 5. Create Float32Array for the tensor
    const tensorSize = MODEL_INPUT_SHAPE.height * MODEL_INPUT_SHAPE.width * MODEL_INPUT_SHAPE.channels;
    const inputTensor = new Float32Array(tensorSize);

    // 6. Populate the tensor with normalized pixel data
    // jpeg-js typically outputs RGBA (4 channels), but MobileNetV2 needs RGB (3 channels)
    const pixelData = rawImageData.data; // Uint8Array: [R1, G1, B1, A1, R2, G2, B2, A2, ...]
    let tensorIndex = 0;
    for (let i = 0; i < pixelData.length; i += 4) { // Step by 4 bytes (RGBA)
      if (tensorIndex >= tensorSize) break; // Prevent overflow if dimensions mismatch slightly

      const r = pixelData[i];     // Red
      const g = pixelData[i + 1]; // Green
      const b = pixelData[i + 2]; // Blue
      // const a = pixelData[i + 3]; // Alpha - discard

      // Normalize and add to tensor (RGB order)
      inputTensor[tensorIndex++] = normalizePixelMobileNetV2(r);
      inputTensor[tensorIndex++] = normalizePixelMobileNetV2(g);
      inputTensor[tensorIndex++] = normalizePixelMobileNetV2(b);
    }

    if (tensorIndex !== tensorSize) {
        console.warn(`Preprocessing issue: Tensor index (${tensorIndex}) does not match expected size (${tensorSize}). Check image channels or loop logic.`);
    }

    console.log('Preprocessing complete. Tensor populated.');
    return inputTensor;

  } catch (error) {
    console.error('Error during image preprocessing for MobileNetV2:', error);
    if (error instanceof Error) {
        console.error('Preprocessing Error details:', error.message, error.stack);
    }
    return null;
  }
};

// --- Inference (No changes needed here) ---
const runInference = async (inputTensor: Float32Array): Promise<any | null> => {
  if (!model) {
    console.error('Model not loaded yet. Call loadModel first.');
    return null;
  }
  try {
    console.log('Running inference...');
    const output = await model.run([inputTensor]);
    console.log('Inference successful. Raw output:', output);
    return output;
  } catch (error) {
    console.error('Error running inference:', error);
    return null;
  }
};

// --- Postprocessing (REVISED AGAIN for Object Output) ---
const postprocessOutput = (output: any): { probability?: number; prediction?: string; error?: string } => {
    console.log("Raw output received for postprocessing:", JSON.stringify(output));

    if (!output) {
        return { error: 'Invalid model output received (null or undefined)' };
    }

    try {
        let probability: number | undefined = undefined;

        // Check if output is an array with at least one element
        if (Array.isArray(output) && output.length > 0) {
            const firstElement = output[0];

            // --- Check if the first element is the OBJECT { '0': value } ---
            if (typeof firstElement === 'object' && firstElement !== null && Object.keys(firstElement).length === 1 && typeof firstElement['0'] === 'number') {
                probability = firstElement['0']; // Extract value using key '0'
            }
            // --- Fallback checks for nested arrays (less likely based on latest log) ---
            else if (Array.isArray(firstElement) && firstElement.length === 1 && typeof firstElement[0] === 'number') {
                // Handles [[probability]]
                probability = firstElement[0];
            } else if (typeof firstElement === 'number' && output.length === 1) {
                 // Handles [probability]
                 probability = firstElement;
            }
        } else if (typeof output === 'number') {
             // Handles probability (raw number)
             probability = output;
        }


        if (probability !== undefined) {
             const threshold = 0.5; // Adjust threshold as needed
             const prediction = probability >= threshold ? 'High IOP Risk' : 'Low IOP Risk';
             console.log(`Postprocessing: Probability=${probability.toFixed(4)}, Prediction=${prediction}`);
             return { probability, prediction };
        } else {
            console.error('Could not extract probability from output structure:', JSON.stringify(output));
            return { error: `Output tensor format not recognized. Structure: ${JSON.stringify(output)}` };
        }

    } catch (error) {
        console.error('Error during postprocessing logic:', error);
        return { error: 'Failed to process output due to an exception.' };
    }
};


export const InferenceService = {
  loadModel,
  preprocessImageToTensor,
  runInference,
  postprocessOutput,
  isModelLoaded: () => !!model,
}; 