import { AlertColor } from '@mui/material';
import React, { useContext } from 'react';

export const ToastContext = React.createContext((msg: string, _status: AlertColor = 'info') =>
  alert(msg)
);

export const useToast = () => useContext(ToastContext);
