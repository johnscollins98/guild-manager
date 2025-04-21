import { SnackbarProvider } from 'notistack';
import { type PropsWithChildren } from 'react';
import { ConfirmContextProvider } from './confirm-dialog/confirm-context-provider';
import QueryProvider from './query-provider';
import { ThemeProvider } from './theme/theme-provider';
import { ToastProvider } from './toast/toast-provider';

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        <SnackbarProvider maxSnack={5} autoHideDuration={3000}>
          <ToastProvider>
            <ConfirmContextProvider>{children}</ConfirmContextProvider>
          </ToastProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryProvider>
  );
};
