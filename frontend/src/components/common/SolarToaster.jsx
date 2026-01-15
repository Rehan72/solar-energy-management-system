import toast from 'react-hot-toast';

const SolarToaster = {
    success: (message) => toast.success(message, {
        style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#4ade80',
            border: '1px solid rgba(74, 222, 128, 0.2)',
        },
        iconTheme: {
            primary: '#4ade80',
            secondary: 'rgba(15, 23, 42, 0.95)',
        },
    }),
    error: (message) => toast.error(message, {
        style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#f87171',
            border: '1px solid rgba(248, 113, 113, 0.2)',
        },
        iconTheme: {
            primary: '#f87171',
            secondary: 'rgba(15, 23, 42, 0.95)',
        },
    }),
    loading: (message) => toast.loading(message, {
        style: {
            background: 'rgba(15, 23, 42, 0.95)',
            color: '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.2)',
        },
    }),
    dismiss: (toastId) => toast.dismiss(toastId),
    custom: (message) => toast(message),
};

export default SolarToaster;
