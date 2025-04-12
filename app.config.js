require("dotenv").config(); // Load .env file

export default {
  expo: {
    name: "high_iop_app",
    slug: "high_iop_app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.bishoyshohdy.highiopapp"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: "com.bishoyshohdy.high_iop_app",
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    extra: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      eas: {
        projectId: "a2fadca1-3156-4877-b643-1168957acb86",
      },
    },
    plugins: [
      "expo-dev-client",
      "expo-secure-store",
      [
        "expo-camera",
        {
          cameraPermission:
            "Allow $(PRODUCT_NAME) to access your camera for eye scanning.",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "Allow $(PRODUCT_NAME) to access your photos to upload fundus images.",
          // "cameraRollPermission": // For older iOS versions if needed
        },
      ],
    ],
    // Enable new architecture
    newArchEnabled: true,
    // Add gesture handler configuration
    hooks: {
      postPublish: [
        {
          file: "node_modules/react-native-gesture-handler/scripts/post-publish.js",
          config: {
            root: "node_modules/react-native-gesture-handler",
          },
        },
      ],
    },
  },
};
