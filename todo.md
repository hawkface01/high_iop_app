# High IOP Detection App - TODO List

This list tracks the progress of integrating the real ML model for IOP detection.

## ✅ Done

*   Project Scaffolding Setup (React Native, Expo)
*   Basic UI Screens Implementation (Login, Home, Settings, etc. - Mock Flow)
*   Firebase Setup (Auth, Firestore basics)
*   Navigation Structure (React Navigation)
*   Defined Project Structure and Context (`CONTEXT.md`)
*   Defined Database Schema (`CONTEXT.md`)
*   Defined UI Design Principles (`CONTEXT.md`)

## ⏳ To Be Completed

### Backend & Model Setup (Supabase)
- [x] Set up Supabase project.
- [x] Create a Supabase Storage bucket for the ML model.
- [x] Upload `model.json` and all associated `.bin` weight files to the Supabase bucket.
- [x] Configure bucket policies (e.g., public read access) and note the URL for `model.json`.
- [x] Install and configure Supabase client library (`@supabase/supabase-js`) in the React Native app.

### Core ML Integration (Using Supabase Model)
- [x] Choose and install a TensorFlow.js library for React Native (e.g., `@tensorflow/tfjs-react-native`) and its dependencies (like `expo-gl` or `react-native-fs`).
- [x] Implement image pre-processing logic (resize to **300x300**, normalization based on model requirements).
- [x] Create/Update ML Service (`src/services/ml/`) to load the TensorFlow.js model **from the Supabase URL** using `tf.loadLayersModel()`.
- [x] (Recommended) Implement model caching logic (e.g., using AsyncStorage or react-native-fs) to store the downloaded model locally.
- [x] Implement inference logic in the ML Service to run the loaded model on a pre-processed image tensor.
- [x] Implement post-processing logic in the ML Service to interpret the single sigmoid output (e.g., thresholding at 0.5 for classification) and determine confidence.
- [x] Integrate ML Service call into the Scan workflow (after image capture/upload).
- [x] Add loading indicators during model download (first time) and inference.
- [x] Update Results Screen (`src/screens/Results/`) to display real data from the ML Service.
- [x] Store actual scan results (IOP level, confidence, etc.) in the Firestore `scans` collection.
- [x] Implement error handling for model download, loading, and inference failures.

### Supporting Tasks
- [ ] Refine Camera Screen (`src/screens/Scan/`) with fundus alignment guides if not already present.
- [ ] Implement image quality checks before running inference (e.g., check for blurriness, incorrect framing).
- [ ] Add unit/integration tests for the ML service.
- [ ] Update Help & Support screen with accurate information about the scanning process and results interpretation.
- [ ] Test thoroughly on both iOS and Android devices.

### Future Enhancements (Optional)
- [ ] Implement background processing for inference if needed for performance.
- [ ] Add periodic model update checks/downloads.
- [ ] Explore cloud-based inference as an alternative/fallback. 