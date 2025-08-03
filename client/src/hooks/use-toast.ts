import { useState } from 'react';

export interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (newToast: Toast) => {
    console.log('Toast:', newToast);
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 5000);
  };

  return { toast };
};