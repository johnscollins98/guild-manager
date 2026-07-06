import ReactDOM from 'react-dom/client';
import 'react-virtualized/styles.css';
import App from './components/app';
import LoaderPage from './components/common/loader-page';
import { Providers } from './components/common/providers';
import { QueryBoundary } from './components/common/query-boundary';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <Providers>
    <QueryBoundary fallback={<LoaderPage />}>
      <App />
    </QueryBoundary>
  </Providers>
);
