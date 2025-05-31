import { type ComponentType, type Key, type PropsWithChildren, Suspense } from 'react';
import { type FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from './error-boundary';
import LoaderPage from './loader-page';

export interface QueryBoundaryProps extends PropsWithChildren {
  fallback?: React.ReactNode;
  errorRender?: ComponentType<FallbackProps>;
  keyName?: Key;
}

export const QueryBoundary = ({
  children,
  keyName,
  fallback = <LoaderPage />,
  errorRender
}: QueryBoundaryProps) => {
  return (
    <Suspense fallback={fallback} key={keyName}>
      <ErrorBoundary errorRender={errorRender}>{children}</ErrorBoundary>
    </Suspense>
  );
};
