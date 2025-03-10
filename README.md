# High IOP Detection App

A mobile application for non-invasive detection of high intraocular pressure (IOP) using fundus images.

## Project Overview

The High Intraocular Pressure (IOP) Detection App provides non-invasive detection of high IOP using fundus images. This application is designed with accessibility in mind, particularly for elderly users who may not be tech-savvy. It features a simple interface with large text and clear instructions.

## Features

- **Non-invasive Eye Pressure Detection**: Using fundus images to detect high intraocular pressure
- **User-friendly Interface**: Designed with elderly users in mind
- **Scan Management**: View, save, share, and delete scan results
- **Secure Data Storage**: All medical data is securely stored in the cloud
- **Personalized Recommendations**: Based on scan results
- **Accessibility Features**: Large text, clear navigation, and straightforward user flow

## Tech Stack

- **Frontend**: React Native with Expo managed workflow, React Navigation, React Native Paper
- **Backend**: Supabase (Authentication, Storage, Database)
- **ML Model**: TensorFlow Lite (custom trained model, on-device inference)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio or Xcode (for simulators)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/bishoyshohdy/high-iop-detection-app.git
   cd high-iop-detection-app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Application Structure

- `src/assets/`: Static assets like images and fonts
- `src/components/`: Reusable UI components
- `src/navigation/`: Navigation configuration
- `src/screens/`: Main application screens
- `src/services/`: API and backend services
- `src/store/`: State management
- `src/utils/`: Helper functions
- `src/lib/`: External libraries configuration

## Key Features Implementation

### Scan Detail Screen

The Scan Detail Screen provides a comprehensive view of eye scan results with the following features:

- Visual representation of IOP pressure readings (Normal/High)
- Display of fundus images in a user-friendly format
- Personalized recommendations based on scan results
- Data management capabilities (save, share, delete)

### Scan Management

Users can:
- View detailed scan results
- Save scans to history
- Share results with healthcare providers
- Delete unwanted scans with confirmation

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- MSA University for supporting the development of this application
- The open-source community for the tools and libraries used in this project
#   h i g h - i o p - d e t e c t i o n - a p p  
 