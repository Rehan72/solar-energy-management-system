import { Toaster } from 'react-hot-toast';

// Solar-themed toast styles matching the project's design system
const SolarToaster = () => {
  return (
    <Toaster
      position="top-right"
      duration={5000}
      containerStyle={{
        top: 80,
        right: 20,
        zIndex: 9999,
      }}
      toastOptions={{
        // Base styles using CSS variables from the solar theme
        style: {
          background: 'var(--solar-card)',
          color: 'var(--solar-primary)',
          border: '1px solid var(--solar-border)',
          borderRadius: '12px',
          padding: '16px',
          boxShadow: '0 10px 40px rgba(245, 158, 11, 0.2)',
          backdropFilter: 'blur(12px)',
          minWidth: '320px',
          fontFamily: 'Inter, sans-serif',
        },
        // Success toast - green with solar yellow accent
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
        // Error toast - red/orange for errors (longer duration)
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
        // Warning toast - yellow/orange for warnings
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
        // Info toast - blue/neutral
        info: {
          iconTheme: {
            primary: 'var(--solar-panel)',
            secondary: 'white',
          },
          style: {
            background: 'linear-gradient(135deg, var(--solar-card) 0%, rgba(59, 130, 246, 0.1) 100%)',
            border: '1px solid var(--solar-panel)',
          },
          duration: 4000,
        },
        // Loading toast - solar yellow theme
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
      }}
    />
  );
};

export default SolarToaster;
