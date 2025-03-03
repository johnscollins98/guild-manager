import { Button } from '@mui/material';
import { Box } from '@mui/system';
import { QueryErrorResetBoundary } from '@tanstack/react-query';
import { type ComponentType, type PropsWithChildren } from 'react';
import { type FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { ErrorMessage } from './error-message';

export interface ErrorBoundaryProps extends PropsWithChildren {
  errorRender?: ComponentType<FallbackProps>;
}

export const ErrorBoundary = ({ children, errorRender = ErrorRender }: ErrorBoundaryProps) => {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ReactErrorBoundary onReset={reset} FallbackComponent={errorRender}>
          {children}
        </ReactErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  );
};

const ErrorRender = ({ error, resetErrorBoundary }: FallbackProps) => (
  <Box display="flex" flex="1" justifyContent="center" alignItems="center" flexDirection="column">
    <ErrorMessage>
      An error occurred while gathering data, please try again.{' '}
      {import.meta.env.DEV && error.toString()}
    </ErrorMessage>
    <Button onClick={resetErrorBoundary}>Try Again</Button>
  </Box>
);
