const { withAndroidManifest } = require('@expo/config-plugins');

// This is a custom plugin that adds additional permissions to AndroidManifest.xml
const withAndroidPermissions = (config) => {
  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;
    const mainApplication = androidManifest.manifest.application[0];

    // Add permissions to the manifest
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    // Define the permissions we want to ensure are present
    const requiredPermissions = [
      'android.permission.DETECT_SCREEN_CAPTURE',
      'android.permission.CAMERA',
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
      'android.permission.READ_MEDIA_IMAGES',
      'android.permission.ACCESS_MEDIA_LOCATION'
    ];

    // Add each permission if it doesn't already exist
    requiredPermissions.forEach(permission => {
      const permissionExists = androidManifest.manifest['uses-permission'].some(
        (p) => p.$?.['android:name'] === permission
      );
      
      if (!permissionExists) {
        androidManifest.manifest['uses-permission'].push({
          $: {
            'android:name': permission,
          },
        });
      }
    });

    return config;
  });
};

module.exports = withAndroidPermissions; 