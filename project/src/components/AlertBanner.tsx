import { AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

type AlertType = 'danger' | 'success' | 'info' | 'warning';

interface AlertBannerProps {
  type: AlertType;
  title: string;
  message: string;
  onClose?: () => void;
  autoClose?: number;
}

const styles: Record<AlertType, { bg: string; border: string; icon: React.ReactNode; title: string }> = {
  danger: {
    bg: 'bg-red-950/60',
    border: 'border-red-600/50',
    icon: <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />,
    title: 'text-red-300',
  },
  warning: {
    bg: 'bg-amber-950/60',
    border: 'border-amber-600/50',
    icon: <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />,
    title: 'text-amber-300',
  },
  success: {
    bg: 'bg-emerald-950/60',
    border: 'border-emerald-600/50',
    icon: <CheckCircle size={18} className="text-emerald-400 flex-shrink-0 mt-0.5" />,
    title: 'text-emerald-300',
  },
  info: {
    bg: 'bg-blue-950/60',
    border: 'border-blue-600/50',
    icon: <Info size={18} className="text-blue-400 flex-shrink-0 mt-0.5" />,
    title: 'text-blue-300',
  },
};

export default function AlertBanner({ type, title, message, onClose, autoClose }: AlertBannerProps) {
  const [visible, setVisible] = useState(true);
  const s = styles[type];

  useEffect(() => {
    if (autoClose) {
      const t = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, autoClose);
      return () => clearTimeout(t);
    }
  }, [autoClose, onClose]);

  if (!visible) return null;

  return (
    <div className={`${s.bg} border ${s.border} rounded-lg p-4 flex gap-3 animate-in slide-in-from-top-2 duration-300`}>
      {s.icon}
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${s.title}`}>{title}</p>
        <p className="text-gray-400 text-sm mt-0.5 break-all">{message}</p>
      </div>
      {onClose && (
        <button onClick={() => { setVisible(false); onClose(); }} className="text-gray-500 hover:text-gray-300 flex-shrink-0">
          <X size={16} />
        </button>
      )}
    </div>
  );
}
