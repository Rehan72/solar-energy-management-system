import toast from 'react-hot-toast';

// Custom toast styles matching solar theme using CSS variables
const solarTheme = {
  style: {
    background: 'var(--solar-card)',
    color: 'var(--solar-primary)',
    border: '1px solid var(--solar-border)',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 40px rgba(245, 158, 11, 0.2)',
    backdropFilter: 'blur(12px)',
    minWidth: '300px',
    fontFamily: 'Inter, sans-serif',
  },
  success: {
    iconTheme: {
      primary: 'var(--solar-success)',
      secondary: 'white',
    },
    style: {
      background: 'linear-gradient(135deg, var(--solar-card) 0%, rgba(16, 185, 129, 0.1) 100%)',
      border: '1px solid var(--solar-success)',
    },
    duration: 2000,
  },
  error: {
    iconTheme: {
      primary: 'var(--solar-danger)',
      secondary: 'white',
    },
    style: {
      background: 'linear-gradient(135deg, var(--solar-card) 0%, rgba(239, 68, 68, 0.1) 100%)',
      border: '1px solid var(--solar-danger)',
    },
    duration: 7000,
  },
  warning: {
    iconTheme: {
      primary: 'var(--solar-warning)',
      secondary: 'var(--solar-primary)',
    },
    style: {
      background: 'linear-gradient(135deg, var(--solar-card) 0%, rgba(245, 158, 11, 0.1) 100%)',
      border: '1px solid var(--solar-warning)',
    },
    duration: 5000,
  },
  loading: {
    iconTheme: {
      primary: 'var(--solar-yellow)',
      secondary: 'var(--solar-primary)',
    },
    style: {
      background: 'linear-gradient(135deg, var(--solar-card) 0%, rgba(245, 158, 11, 0.1) 100%)',
      border: '1px solid var(--solar-yellow)',
    },
  },
};

// Info toast style
const infoTheme = {
  ...solarTheme,
  iconTheme: {
    primary: 'var(--solar-panel)',
    secondary: 'white',
  },
  style: {
    ...solarTheme.style,
    background: 'linear-gradient(135deg, var(--solar-card) 0%, rgba(59, 130, 246, 0.1) 100%)',
    border: '1px solid var(--solar-panel)',
  },
  duration: 4000,
};

// Toast helper functions
export const notify = {
  success: (message) => toast.success(message, solarTheme),
  error: (message) => toast.error(message, solarTheme),
  warning: (message) => toast(message, { ...solarTheme, icon: '⚠️' }),
  info: (message) => toast(message, infoTheme),
  loading: (message) => toast.loading(message, solarTheme),
  promise: (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Done!',
      error: messages.error || 'Error!',
    }, solarTheme);
  },
};

export default notify;
