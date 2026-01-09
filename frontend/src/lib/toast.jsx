import { toast } from 'react-hot-toast';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

// Custom Toast Component matching the design
const SolarToast = ({ message, type = 'success', icon: Icon }) => {
  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return { accentColor: '#10B981' };
      case 'error':
        return { accentColor: '#EF4444' };
      case 'warning':
        return { accentColor: '#F59E0B' };
      case 'info':
        return { accentColor: '#3B82F6' };
      default:
        return { accentColor: '#64748B' };
    }
  };

  const { accentColor } = getTypeStyles();

  return (
    <div
      className="solar-toast-container"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
        borderRadius: '16px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '14px',
        minWidth: '340px',
        maxWidth: '400px',
        border: `1px solid ${accentColor}30`,
        boxShadow: `0 10px 40px rgba(0, 0, 0, 0.4), 0 0 20px ${accentColor}15`,
        backdropFilter: 'blur(12px)',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {/* Icon */}
      <div
        style={{
          background: `${accentColor}15`,
          borderRadius: '50%',
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {Icon && (
          <Icon
            size={22}
            color={accentColor}
            style={{ animation: 'toast-icon-pulse 2s ease-in-out infinite' }}
          />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4
          style={{
            color: '#F1F5F9',
            fontSize: '15px',
            fontWeight: 600,
            margin: 0,
            marginBottom: '4px',
            lineHeight: 1.4,
          }}
        >
          {message.title}
        </h4>
        {message.description && (
          <p
            style={{
              color: '#94A3B8',
              fontSize: '13px',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {message.description}
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => toast.dismiss()}
        style={{
          background: 'transparent',
          border: 'none',
          color: '#64748B',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
          marginLeft: '8px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#334155';
          e.currentTarget.style.color = '#F1F5F9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = '#64748B';
        }}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// Helper functions to show toasts with custom styling
export const showSolarToast = {
  success: (title, description) => {
    return toast.custom(() => (
      <SolarToast message={{ title, description }} type="success" icon={CheckCircle} />
    ));
  },
  error: (title, description) => {
    return toast.custom(() => (
      <SolarToast message={{ title, description }} type="error" icon={AlertCircle} />
    ));
  },
  warning: (title, description) => {
    return toast.custom(() => (
      <SolarToast message={{ title, description }} type="warning" icon={AlertTriangle} />
    ));
  },
  info: (title, description) => {
    return toast.custom(() => (
      <SolarToast message={{ title, description }} type="info" icon={Info} />
    ));
  },
};

// Backward compatibility alias
export const notify = showSolarToast;
