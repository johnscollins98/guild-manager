import { type AlertColor } from '@mui/material';
import { useSnackbar } from 'notistack';
import { type PropsWithChildren, useCallback } from 'react';
import { ToastContext } from './toast-context';

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const { enqueueSnackbar } = useSnackbar();

  const openToast = useCallback(
    (message: string, status: AlertColor = 'info') => {
      enqueueSnackbar({
        message,
        variant: status
      });
    },
    [enqueueSnackbar]
  );

  return <ToastContext.Provider value={openToast}>{children}</ToastContext.Provider>;
};
