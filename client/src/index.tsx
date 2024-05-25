import ReactDOM from 'react-dom/client';
import 'react-virtualized/styles.css';
import QueryProvider from './components/query-provider';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
ReactDOM.createRoot(document.getElementById('root')!).render(<QueryProvider />);
