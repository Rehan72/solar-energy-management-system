import { Toaster } from 'react-hot-toast';

// Solar-themed toast configuration matching the design in the image
const SolarToaster = () => {
  return (
    <Toaster
      position="top-right"
      duration={5000}
      containerStyle={{
        top: 60,
        right: 20,
        zIndex: 9999,
      }}
      toastOptions={{
        className: 'solar-toast',
        style: {
          background: 'transparent',
          color: 'transparent',
          padding: 0,
          boxShadow: 'none',
          borderRadius: '16px',
        },
      }}
      gutter={12}
    />
  );
};

export default SolarToaster;
