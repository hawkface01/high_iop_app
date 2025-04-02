const { withAndroidManifest } = require('@expo/config-plugins');

// This is a custom plugin that adds the DETECT_SCREEN_CAPTURE permission to AndroidManifest.xml
const withAndroidPermissions = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Add the permission to the manifest
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    // Check if the permission already exists
    const permissionExists = androidManifest.manifest['uses-permission'].some(
      (permission) => 
        permission.$?.['android:name'] === 'android.permission.DETECT_SCREEN_CAPTURE'
    );

    // Add the permission if it doesn't exist
    if (!permissionExists) {
      androidManifest.manifest['uses-permission'].push({
        $: {
          'android:name': 'android.permission.DETECT_SCREEN_CAPTURE',
        },
      });
    }

    return config;
  });
};

module.exports = withAndroidPermissions; 