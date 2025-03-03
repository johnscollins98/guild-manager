import { type ComponentType, type PropsWithChildren, Suspense } from 'react';
import { type FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from './error-boundary';
import LoaderPage from './loader-page';

export interface QueryBoundaryProps extends PropsWithChildren {
  fallback?: React.ReactNode;
  errorRender?: ComponentType<FallbackProps>;
}

export const QueryBoundary = ({
  children,
  fallback = <LoaderPage />,
  errorRender
}: QueryBoundaryProps) => {
  return (
    <Suspense fallback={fallback}>
      <ErrorBoundary errorRender={errorRender}>{children}</ErrorBoundary>
    </Suspense>
  );
};
