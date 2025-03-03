import { type ComponentType, type Key, type PropsWithChildren, Suspense } from 'react';
import { type FallbackProps } from 'react-error-boundary';
import { ErrorBoundary } from './error-boundary';
import LoaderPage from './loader-page';

export interface QueryBoundaryProps extends PropsWithChildren {
  fallback?: React.ReactNode;
  errorRender?: ComponentType<FallbackProps>;
  key?: Key;
}

export const QueryBoundary = ({
  children,
  key,
  fallback = <LoaderPage />,
  errorRender
}: QueryBoundaryProps) => {
  return (
    <Suspense fallback={fallback} key={key}>
      <ErrorBoundary errorRender={errorRender}>{children}</ErrorBoundary>
    </Suspense>
  );
};
