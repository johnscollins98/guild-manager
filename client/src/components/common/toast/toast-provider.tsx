import { Alert, type AlertColor, Snackbar } from '@mui/material';
import { type PropsWithChildren, useCallback, useState } from 'react';
import { ToastContext } from './toast-context';

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [showToast, setShowToast] = useState(false);
  const [toastStatus, setToastStatus] = useState<AlertColor>('info');
  const [toastMessage, setToastMessage] = useState('');

  const openToast = useCallback(
    (message: string, status: AlertColor = 'info') => {
      setToastStatus(status);
      setToastMessage(message);
      setShowToast(true);
    },
    [setToastMessage, setShowToast, setToastStatus]
  );

  const closeToast = useCallback(() => {
    setToastMessage('');
    setShowToast(false);
  }, [setToastMessage, setShowToast]);

  return (
    <ToastContext.Provider value={openToast}>
      {children}
      <Snackbar open={showToast} autoHideDuration={3000} onClose={() => closeToast()}>
        <Alert onClose={() => closeToast()} severity={toastStatus}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
};
