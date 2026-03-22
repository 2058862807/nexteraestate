// Capacitor stub for web deployment
export interface DeviceInfo {
  platform: string;
  isNative: boolean;
  model?: string;
  operatingSystem?: string;
}

export const useCapacitor = () => {
  return {
    deviceInfo: { platform: 'web', isNative: false },
    hapticFeedback: async () => {},
    takePicture: async () => { throw new Error('Not available on web'); },
    saveDocument: async (data: string, fileName: string) => {
      const link = document.createElement('a');
      link.href = data;
      link.download = fileName;
      link.click();
    },
    isNative: false,
    platform: 'web'
  };
};
