import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { decodeJpeg } from '@tensorflow/tfjs-react-native';

/**
 * Preprocesses an image for the ML model.
 * 1. Resizes the image to 300x300 pixels.
 * 2. Converts the image to a TensorFlow.js tensor.
 * 3. Normalizes pixel values to the range [0, 1].
 * 4. Adds a batch dimension.
 *
 * @param imageUri The URI of the image to preprocess.
 * @returns A Promise resolving to the preprocessed image tensor.
 */
export async function preprocessImage(imageUri: string): Promise<tf.Tensor> {
  console.log('Preprocessing image:', imageUri);

  // 1. Resize the image
  const manipResult = await ImageManipulator.manipulateAsync(
    imageUri,
    [{ resize: { width: 300, height: 300 } }],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG, base64: false } // Keep JPEG format
  );
  console.log('Resized image URI:', manipResult.uri);

  // 2. Read the resized image file as base64 data for TFJS
  const imgB64 = await FileSystem.readAsStringAsync(manipResult.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
  const rawImageData = new Uint8Array(imgBuffer);

  // 3. Decode JPEG and create tensor
  // decodeJpeg expects a Uint8Array
  const imageTensor = decodeJpeg(rawImageData);

  // 4. Normalize the tensor (rescale to [0, 1])
  const normalizedTensor = imageTensor.div(tf.scalar(255.0));

  // 5. Add batch dimension (assuming model expects [batch_size, height, width, channels])
  const batchedTensor = normalizedTensor.expandDims(0);

  // Clean up the temporary resized image file
  await FileSystem.deleteAsync(manipResult.uri, { idempotent: true });
  console.log('Preprocessing complete. Tensor shape:', batchedTensor.shape);

  // Dispose the intermediate tensor to free memory
  imageTensor.dispose();
  normalizedTensor.dispose();


  return batchedTensor; // Return the final batched and normalized tensor
}

// --- Model Loading with Caching ---

// Base URL for the model files in Supabase storage
// Fix URL format: Restoring the standard Supabase storage URL format with "object/public"
const MODEL_BASE_URL = 'https://ycciqvsehzurdhjagwrr.supabase.co/storage/v1/object/public/ml-model/';
const MODEL_JSON_FILENAME = 'model.json';
const MODEL_URL = MODEL_BASE_URL + MODEL_JSON_FILENAME;

// For debugging purposes: test if the URL is accessible
export async function testModelUrl() {
  console.log('Testing model URL accessibility:', MODEL_URL);
  try {
    const response = await fetch(MODEL_URL, {
      method: 'HEAD',  // Just check headers, don't download the file
    });
    
    if (response.ok) {
      console.log('Model URL is accessible! Status:', response.status);
      return true;
    } else {
      console.error('Model URL returned error status:', response.status);
      return false;
    }
  } catch (error) {
    console.error('Error testing model URL:', error);
    return false;
  }
}

// Local directory to store the downloaded model files
const LOCAL_MODEL_DIR = FileSystem.documentDirectory + 'ml_model/'; // Persistent directory
const LOCAL_MODEL_JSON_PATH = LOCAL_MODEL_DIR + MODEL_JSON_FILENAME;

let loadedModel: tf.LayersModel | null = null;

/**
 * Downloads the model file if it doesn't exist locally.
 * @param remoteUrl URL to download from.
 * @param localPath Path to save the file locally.
 * @returns Promise resolving when download is complete or if file exists.
 */
async function ensureModelFileExists(remoteUrl: string, localPath: string) {
  const fileInfo = await FileSystem.getInfoAsync(localPath);
  if (!fileInfo.exists) {
    console.log(`Downloading ${remoteUrl} to ${localPath}...`);
    await FileSystem.downloadAsync(remoteUrl, localPath);
    console.log(`Downloaded ${remoteUrl} successfully.`);
  } else {
    console.log(`File already exists locally: ${localPath}`);
  }
}

// Add a function to clear the model cache
export async function clearModelCache(): Promise<boolean> {
  try {
    // Check if model directory exists
    const dirInfo = await FileSystem.getInfoAsync(LOCAL_MODEL_DIR);
    if (dirInfo.exists) {
      console.log('Clearing model cache...');
      await FileSystem.deleteAsync(LOCAL_MODEL_DIR, { idempotent: true });
      console.log('Model cache cleared successfully');
      return true;
    } else {
      console.log('No model cache to clear');
      return true; // Return true if there was no cache to clear
    }
  } catch (error) {
    console.error('Error clearing model cache:', error);
    return false;
  }
}

/**
 * Loads the TensorFlow.js model.
 * Checks for a cached version locally first.
 * If not cached, downloads the model.json and associated weights,
 * stores them locally, and then loads the model.
 * @returns A Promise resolving to the loaded tf.LayersModel or null if loading fails.
 */
export async function loadModel(forceReload = false, _retryAttempted = false): Promise<tf.LayersModel | null> {
  if (loadedModel && !forceReload) {
    console.log('Model already in memory.');
    return loadedModel;
  }

  if (forceReload && loadedModel) {
    console.log('Force reload requested. Clearing in-memory model.');
    loadedModel.dispose();
    loadedModel = null;
  }

  try {
    await tf.ready();
    console.log('TF Ready. Checking for model...');

    if (forceReload && !_retryAttempted) { // Only clear cache on explicit force reload, not on internal retry
      console.log('Explicit force reload requested. Clearing model cache.');
      await clearModelCache();
    }

    await FileSystem.makeDirectoryAsync(LOCAL_MODEL_DIR, { intermediates: true });

    const modelJsonInfo = await FileSystem.getInfoAsync(LOCAL_MODEL_JSON_PATH);
    let modelJsonString: string | null = null;
    let modelManifest: any = null;

    // --- Download or Validate Cache --- 
    if (!modelJsonInfo.exists) {
      console.log('Model not found locally. Downloading...');
      try {
        await ensureModelFileExists(MODEL_URL, LOCAL_MODEL_JSON_PATH);
        modelJsonString = await FileSystem.readAsStringAsync(LOCAL_MODEL_JSON_PATH);
        modelManifest = JSON.parse(modelJsonString);
        if (!modelManifest?.weightsManifest?.[0]?.paths) throw new Error('Invalid model.json: missing weightsManifest/paths');
        
        // Download weights
        const weightFiles = modelManifest.weightsManifest[0].paths as string[];
        console.log(`Downloading ${weightFiles.length} weight file(s)...`);
        for (const weightFile of weightFiles) {
          const remoteWeightUrl = MODEL_BASE_URL + weightFile;
          const localWeightPath = LOCAL_MODEL_DIR + weightFile;
          await ensureModelFileExists(remoteWeightUrl, localWeightPath);
          const weightFileInfo = await FileSystem.getInfoAsync(localWeightPath);
          if (!weightFileInfo.exists) throw new Error(`Failed to download/verify weight file: ${weightFile}`);
        }
        console.log('All model files downloaded successfully.');
      } catch (downloadError: any) {
        console.error('Error during model download/validation:', downloadError);
        await clearModelCache(); // Clear cache on download error
        throw new Error(`Failed to download/validate model files: ${downloadError.message}`);
      }
    } else {
      console.log('Model found in cache. Validating...');
      try {
        modelJsonString = await FileSystem.readAsStringAsync(LOCAL_MODEL_JSON_PATH);
        modelManifest = JSON.parse(modelJsonString);
         if (!modelManifest?.weightsManifest?.[0]?.paths) throw new Error('Invalid cached model.json: missing weightsManifest/paths');
        
        // Check weights exist
        const weightFiles = modelManifest.weightsManifest[0].paths as string[];
        for (const weightFile of weightFiles) {
          const localWeightPath = LOCAL_MODEL_DIR + weightFile;
          const weightFileInfo = await FileSystem.getInfoAsync(localWeightPath);
          if (!weightFileInfo.exists) {
             console.warn(`Cache missing weight file: ${weightFile}.`);
             throw new Error(`Missing weight file in cache: ${weightFile}`); // Trigger retry
          }
        }
        console.log('Cached model files validated successfully.');
      } catch (validateError: any) {
        console.error('Cached model is invalid or incomplete:', validateError);
        if (!_retryAttempted) {
           console.log('Clearing invalid cache and attempting redownload...');
           await clearModelCache();
           return loadModel(true, true); // Retry ONCE with force flag and retry flag
        } else {
           console.error('Failed to validate cache even after retry.');
           throw new Error('Failed to validate cache after redownload.');
        }
      }
    }

    // --- Load model from local file system --- 
    console.log('Attempting to load model from local path:', LOCAL_MODEL_JSON_PATH);
    if (modelJsonString) {
       // Log structure details for debugging
       console.log('Model format:', modelManifest?.format);
       console.log('Generated by:', modelManifest?.generatedBy);
       console.log('Converted by:', modelManifest?.convertedBy);
       console.log('First layer config (sample):', JSON.stringify(modelManifest?.modelTopology?.model_config?.layers?.[0]?.config)?.substring(0, 150) + '...');
       console.log('Model JSON (start):', modelJsonString.substring(0, 100) + '...');
    }
    
    try {
      // Use the parsed manifest directly if available and valid? (tfjs might prefer file path)
      loadedModel = await tf.loadLayersModel('file://' + LOCAL_MODEL_JSON_PATH);
      console.log('Model loaded successfully.');
      return loadedModel; // SUCCESS

    } catch (loadError: any) {
      console.error('tf.loadLayersModel failed:', loadError.message);

      // Check if it's a structural/config error vs. file system error
      const isStructureError = loadError.message?.includes('Layer') || 
                               loadError.message?.includes('Shape') || 
                               loadError.message?.includes('Expected') || 
                               loadError.message?.includes('config'); 
                               // Add more keywords if needed

      if (isStructureError) {
         console.error('*** Model Structure Error Detected ***');
         console.error('This likely means the model.json file is incompatible or malformed.');
         console.error('The downloaded files will NOT be deleted from the cache to allow inspection.');
         console.error(`Local model path: ${LOCAL_MODEL_JSON_PATH}`);
         // DO NOT CLEAR CACHE OR RETRY FOR STRUCTURE ERRORS
         throw new Error(`Model Structure Error: ${loadError.message}. Please inspect the model.json file at the path above.`);
      } else {
        // Assume other errors might be transient file system issues
        console.warn('Potential cache/file system error during load.');
         if (!_retryAttempted) {
           console.log('Clearing cache and attempting redownload ONCE...');
           await clearModelCache();
           return loadModel(true, true); // Retry ONCE
        } else {
           console.error('Failed to load model from file system even after retry.');
           throw new Error('Failed loading model from file system after redownload.');
        }
      }
    }

  } catch (error: any) {
    // Catch errors from download, validation, or the final loading attempts
    console.error('*** CRITICAL ERROR DURING MODEL LOADING ***');
    console.error('Error:', error.message);
    loadedModel = null;
    return null; // Return null indicating failure
  }
}

/**
 * Runs inference on the loaded model with the preprocessed image tensor.
 *
 * @param model The loaded TensorFlow.js model.
 * @param tensor The preprocessed image tensor (batched and normalized).
 * @returns A Promise resolving to the raw prediction tensor or null if inference fails.
 */
export async function runInference(
  model: tf.LayersModel | null,
  tensor: tf.Tensor
): Promise<tf.Tensor | null> {
  if (!model) {
    console.error('Model not loaded for inference.');
    return null;
  }
  if (!tensor) {
    console.error('Input tensor is missing for inference.');
    return null;
  }

  console.log('Running inference with tensor shape:', tensor.shape);

  try {
    // Run predict on the model
    const prediction = model.predict(tensor) as tf.Tensor;
    console.log('Inference complete. Prediction tensor:', prediction);
    // prediction.print(); // Optional: Print the raw output tensor values

    return prediction;
  } catch (error) {
    console.error('Error during inference:', error);
    return null;
  } finally {
    // IMPORTANT: Dispose the input tensor to free up memory
    // The calling code should dispose the prediction tensor when done
    if (tensor) {
        tensor.dispose();
        console.log('Input tensor disposed.');
    }
  }
}

// --- Post-processing --- 

/**
 * Represents the structured result of the IOP detection.
 */
export interface IOPResult {
  classification: 'High IOP' | 'Normal IOP' | 'Error';
  confidence: number; // Probability of 'High IOP' (0 to 1)
}

/**
 * Postprocesses the raw prediction tensor from the model.
 * Assumes a single sigmoid output representing the probability of 'High IOP'.
 *
 * @param predictionTensor The raw output tensor from model.predict().
 * @returns An IOPResult object with classification and confidence.
 */
export async function postprocessResult(predictionTensor: tf.Tensor | null): Promise<IOPResult> {
  if (!predictionTensor) {
    console.error('Cannot postprocess null tensor.');
    return { classification: 'Error', confidence: 0 };
  }

  try {
    // Ensure tensor is on CPU for data extraction
    await predictionTensor.data(); 

    // Get the raw prediction value (should be a single value between 0 and 1)
    const predictionData = predictionTensor.dataSync(); // Use dataSync for simplicity here
    const confidence = predictionData[0];

    // Determine classification based on a threshold (e.g., 0.5)
    const classification = confidence > 0.5 ? 'High IOP' : 'Normal IOP';

    console.log(`Postprocessing complete: Confidence=${confidence.toFixed(4)}, Classification=${classification}`);

    return {
      classification,
      confidence,
    };
  } catch (error) {
    console.error('Error during postprocessing:', error);
    return { classification: 'Error', confidence: 0 };
  } finally {
    // Dispose the prediction tensor now that we're done with it
    if (predictionTensor) {
      predictionTensor.dispose();
      console.log('Prediction tensor disposed.');
    }
  }
} 