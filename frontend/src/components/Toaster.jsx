import { Toaster } from 'react-hot-toast';

/**
 * SolarToaster - A premium, highly-styled toast container for the Solar Energy Management System.
 * Optimized with smooth entry/exit animations and consistent solar aesthetics.
 */
const SolarToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        // We use custom components via toast.custom, but these fallbacks ensure consistency
        className: 'solar-toast-base',
        style: {
          background: 'rgba(15, 23, 42, 0.95)',
          color: '#f8fafc',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          padding: '0px',
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
        },
      }}
      containerStyle={{
        top: 40,
        right: 20,
        zIndex: 99999,
      }}
      limit={3}
      gutter={14}
      reverseOrder={false}
    />
  );
};

export default SolarToaster;
