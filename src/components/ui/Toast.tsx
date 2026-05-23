import React, { useEffect } from 'react';
import { Bell } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, visible, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose, duration]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-bg-surface-elevated border border-border-highlight text-text-primary px-5 py-3 rounded-xl flex items-center gap-3 shadow-2xl z-[9999] animate-slide-up">
      <Bell className="w-5 h-5 text-accent-primary" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};
export default Toast;
