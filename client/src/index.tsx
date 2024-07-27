import ReactDOM from 'react-dom/client';
import 'react-virtualized/styles.css';
import App from './components/app';
import { Providers } from './components/common/providers';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(
  <Providers>
    <App />
  </Providers>
);
