import { toast } from 'react-hot-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

/**
 * SolarToast - A premium, animated notification component.
 * Features glassmorphism, dynamic accent borders, and optimized transitions.
 */
const SolarToast = ({ message, type = 'success', icon: Icon, toastId }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { accentColor: '#10B981', labelColor: '#34D399', shadow: 'rgba(16, 185, 129, 0.2)' };
      case 'error':
        return { accentColor: '#EF4444', labelColor: '#F87171', shadow: 'rgba(239, 68, 68, 0.2)' };
      case 'warning':
        return { accentColor: '#F59E0B', labelColor: '#FBBF24', shadow: 'rgba(245, 158, 11, 0.2)' };
      case 'info':
        return { accentColor: '#3B82F6', labelColor: '#60A5FA', shadow: 'rgba(59, 130, 246, 0.2)' };
      default:
        return { accentColor: '#F59E0B', labelColor: '#FBBF24', shadow: 'rgba(245, 158, 11, 0.2)' };
    }
  };

  const { accentColor, labelColor, shadow } = getTypeStyles();

  return (
    <div
      className={`group relative flex items-center gap-4 p-4 min-w-[360px] max-w-[440px] rounded-2xl border border-white/5 backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1`}
      style={{
        background: 'linear-gradient(160deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)',
        boxShadow: `0 20px 40px -10px rgba(0,0,0,0.6), 0 0 20px -5px ${shadow}`,
      }}
    >
      {/* Dynamic Left Accent Bar */}
      <div
        className="absolute left-0 top-4 bottom-4 w-1 rounded-r-full"
        style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
      ></div>

      {/* Hero Icon Section */}
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-500 group-hover:rotate-12"
        style={{ background: `${accentColor}15` }}
      >
        {Icon && (
          <Icon
            size={24}
            color={accentColor}
            className="animate-[pulse_2s_infinite]"
          />
        )}
      </div>

      {/* Textual Content */}
      <div className="flex-1 overflow-hidden">
        <h4 className="text-[15px] font-bold tracking-tight text-white mb-0.5">
          {message.title}
        </h4>
        {message.description && (
          <p className="text-[13px] font-medium text-slate-400 leading-relaxed truncate">
            {message.description}
          </p>
        )}
      </div>

      {/* Interaction: Dismiss Button */}
      <button
        onClick={() => toast.dismiss(toastId)}
        className="ml-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-all hover:bg-white/10 hover:text-white"
      >
        <X size={18} />
      </button>

      {/* Subtle Progress Underline (Visual Decor) */}
      <div
        className="absolute bottom-0 left-4 right-4 h-[1px] opacity-20"
        style={{ background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)` }}
      ></div>
    </div>
  );
};

// Internal helper to handle unique toast IDs preventing duplicates
const generateToastId = (title, description) => `${title}-${description || ''}`;

/**
 * showSolarToast - Unified utility for triggering high-performance solar toasts.
 * Optimized to prevent duplication of identical messages.
 */
export const showSolarToast = {
  success: (title, description) => {
    return toast.custom((t) => (
      <SolarToast
        toastId={t.id}
        message={{ title, description }}
        type="success"
        icon={CheckCircle}
      />
    ), {
      duration: 4000,
      id: generateToastId(title, description)
    });
  },
  error: (title, description) => {
    return toast.custom((t) => (
      <SolarToast
        toastId={t.id}
        message={{ title, description }}
        type="error"
        icon={AlertCircle}
      />
    ), {
      duration: 5000,
      id: generateToastId(title, description)
    });
  },
  warning: (title, description) => {
    return toast.custom((t) => (
      <SolarToast
        toastId={t.id}
        message={{ title, description }}
        type="warning"
        icon={AlertTriangle}
      />
    ), {
      duration: 4000,
      id: generateToastId(title, description)
    });
  },
  info: (title, description) => {
    return toast.custom((t) => (
      <SolarToast
        toastId={t.id}
        message={{ title, description }}
        type="info"
        icon={Info}
      />
    ), {
      duration: 4000,
      id: generateToastId(title, description)
    });
  },
};

export const notify = showSolarToast;
