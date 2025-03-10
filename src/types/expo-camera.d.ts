declare module 'expo-camera' {
  import { Component } from 'react';
  
  export interface CameraProps {
    type?: any;
    ratio?: string;
    style?: any;
    ref?: any;
  }
  
  export default class Camera extends Component<CameraProps> {
    static Constants: {
      Type: {
        back: any;
        front: any;
      }
    };
    
    static requestCameraPermissionsAsync(): Promise<{ status: string }>;
    takePictureAsync(options?: any): Promise<{ uri: string }>;
  }
} 