# High IOP Detection App

A mobile application for non-invasive detection of high intraocular pressure using fundus images.

## Overview

The High IOP Detection App provides a user-friendly interface for capturing fundus images and analyzing them for signs of high intraocular pressure. Designed with accessibility in mind, particularly for elderly users, the app features a simple interface with large text and clear instructions.

## Features

- User authentication and profile management
- Fundus image capture with camera guidance
- Image upload from gallery
- AI-powered analysis of fundus images
- Results display with confidence level
- History tracking of past scans
- Recommendations based on scan results
- Appointment scheduling

## Tech Stack

- **Frontend**: React Native with Expo managed workflow
- **UI Components**: React Native Paper
- **Navigation**: React Navigation
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **ML Model**: TensorFlow Lite (on-device inference)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- Android Studio or Xcode (for emulators)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/high_iop_app.git
   cd high_iop_app
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

4. Run on a device or emulator:
   - Press `a` for Android
   - Press `i` for iOS
   - Scan the QR code with the Expo Go app on your physical device

## Project Structure

```
/
├── src/
│   ├── assets/            # Static assets (images, fonts)
│   ├── components/        # Reusable UI components
│   ├── navigation/        # Navigation configuration
│   ├── screens/           # Main application screens
│   ├── services/          # API and backend services
│   ├── store/             # State management
│   ├── utils/             # Helper functions
│   └── App.tsx            # Root component
├── firebase/              # Firebase configuration
├── docs/                  # Documentation
└── __tests__/             # Test files
```

## Accessibility Features

- Large, readable text using Inter font
- High contrast color scheme
- Large touch targets
- Simple, intuitive navigation
- Clear error messages and recovery options

## Development Team

Developed by students at MSA University as part of a research project on early detection of high intraocular pressure.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 