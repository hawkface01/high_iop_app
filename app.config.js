require('dotenv').config(); // Load .env file

export default {
  expo: {
    name: 'high_iop_app',
    slug: 'high_iop_app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff'
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff'
      },
      package: "com.bishoyshohdy.high_iop_app"
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: 'YOUR_EAS_PROJECT_ID' // Replace if using EAS Build
      }
    },
    plugins: [
      'expo-secure-store',
      [
        'expo-camera',
        {
          "cameraPermission": "Allow $(PRODUCT_NAME) to access your camera for eye scanning."
        }
      ],
      [
        'expo-image-picker',
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos to upload fundus images.",
          // "cameraRollPermission": // For older iOS versions if needed
        }
      ]
    ]
  }
}; 