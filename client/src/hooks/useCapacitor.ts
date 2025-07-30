import { useEffect, useState } from 'react';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Device } from '@capacitor/device';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface DeviceInfo {
  platform: string;
  isNative: boolean;
  model?: string;
  operatingSystem?: string;
}

export const useCapacitor = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    platform: 'web',
    isNative: false
  });

  useEffect(() => {
    const initializeCapacitor = async () => {
      try {
        // Get device information
        const info = await Device.getInfo();
        setDeviceInfo({
          platform: info.platform,
          isNative: info.platform !== 'web',
          model: info.model,
          operatingSystem: info.operatingSystem
        });

        // Configure status bar for mobile
        if (info.platform !== 'web') {
          await StatusBar.setStyle({ style: Style.Default });
          await StatusBar.setBackgroundColor({ color: '#ffffff' });
        }

        // Only initialize mobile-specific features on native platforms
        if (info.platform !== 'web') {
          // Hide splash screen after app loads
          await SplashScreen.hide();

          // Set up keyboard behavior
          Keyboard.addListener('keyboardWillShow', () => {
            document.body.classList.add('keyboard-open');
          });

          Keyboard.addListener('keyboardWillHide', () => {
            document.body.classList.remove('keyboard-open');
          });

          // Handle app state changes
          App.addListener('appStateChange', ({ isActive }) => {
            console.log('App state changed. Is active?', isActive);
          });
        }

      } catch (error) {
        console.log('Capacitor initialization error (likely running on web):', error);
      }
    };

    initializeCapacitor();
  }, []);

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (deviceInfo.platform === 'web') {
      return; // Skip haptics on web
    }
    try {
      await Haptics.impact({ style });
    } catch (error) {
      console.log('Haptics not available:', error);
    }
  };

  const takePicture = async () => {
    if (deviceInfo.platform === 'web') {
      throw new Error('Camera not available on web platform');
    }
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      });
      
      return image.dataUrl;
    } catch (error) {
      console.error('Error taking picture:', error);
      throw error;
    }
  };

  const saveDocument = async (data: string, fileName: string) => {
    try {
      if (deviceInfo.platform === 'web') {
        // Fallback for web - trigger download
        const link = document.createElement('a');
        link.href = data;
        link.download = fileName;
        link.click();
        return;
      }

      await Filesystem.writeFile({
        path: fileName,
        data: data,
        directory: Directory.Documents
      });

      return true;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  };

  return {
    deviceInfo,
    hapticFeedback,
    takePicture,
    saveDocument,
    isNative: deviceInfo.isNative,
    platform: deviceInfo.platform
  };
};