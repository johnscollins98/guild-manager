import { Alert, AlertTitle } from '@mui/material';
import type React from 'react';
import { type PropsWithChildren } from 'react';

export const ErrorMessage: React.FC<PropsWithChildren> = ({ children }) => (
  <Alert severity="error">
    <AlertTitle>Error</AlertTitle>
    {children}
  </Alert>
);
