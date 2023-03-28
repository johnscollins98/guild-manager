import { AlertColor } from '@mui/material';
import React, { useContext } from 'react';

export type ToastContextType = (msg: string, status?: AlertColor) => void;

export const ToastContext = React.createContext<ToastContextType>((msg: string) => alert(msg));

export const useToast = () => useContext(ToastContext);
