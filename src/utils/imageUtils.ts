import * as ImageManipulator from 'expo-image-manipulator';
import jpeg from 'jpeg-js';
import { Buffer } from 'buffer'; // Ensure buffer is available

const RESIZED_WIDTH = 500;
const BLUR_THRESHOLD = 35; // This threshold might need tuning (previously 100)

/**
 * Calculates the variance of the Laplacian of an image to detect blur.
 * @param imageUri The URI of the image to analyze.
 * @returns True if the image is considered blurry, false otherwise.
 */
export async function isImageBlurry(imageUri: string): Promise<boolean> {
  try {
    // 1. Resize and get image data as base64
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: RESIZED_WIDTH } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );

    if (!manipulatedImage.base64) {
      console.error('Failed to get base64 data from image.');
      return false; // Or throw an error
    }

    // 2. Decode JPEG data
    const rawImageData = Buffer.from(manipulatedImage.base64, 'base64');
    const decodedImage = jpeg.decode(rawImageData, { useTArray: true });
    const { width, height, data: rgbaData } = decodedImage;

    // 3. Convert to grayscale
    const grayScaleData = new Uint8Array(width * height);
    for (let i = 0; i < rgbaData.length; i += 4) {
      const r = rgbaData[i];
      const g = rgbaData[i + 1];
      const b = rgbaData[i + 2];
      grayScaleData[i / 4] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    // 4. Apply Laplacian operator
    const laplacianData = [];
    let sumLaplacian = 0;
    let sumLaplacianSq = 0;

    // Kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const center = grayScaleData[y * width + x];
        const top = grayScaleData[(y - 1) * width + x];
        const bottom = grayScaleData[(y + 1) * width + x];
        const left = grayScaleData[y * width + (x - 1)];
        const right = grayScaleData[y * width + (x + 1)];

        const laplacianValue = top + bottom + left + right - 4 * center;
        laplacianData.push(laplacianValue);
        sumLaplacian += laplacianValue;
        sumLaplacianSq += laplacianValue * laplacianValue;
      }
    }

    if (laplacianData.length === 0) {
        console.warn('Laplacian data is empty, possibly a very small image.');
        return false; // Not enough data to determine blur
    }

    // 5. Calculate variance of Laplacian values
    const meanLaplacian = sumLaplacian / laplacianData.length;
    const variance = (sumLaplacianSq / laplacianData.length) - (meanLaplacian * meanLaplacian);

    console.log(`Image Laplacian Variance: ${variance}`);
    return variance < BLUR_THRESHOLD;

  } catch (error) {
    console.error('Error during blur detection:', error);
    // In case of error, assume not blurry to not block the user unnecessarily,
    // or handle error more gracefully (e.g., by re-throwing or returning a specific error state)
    return false;
  }
}
