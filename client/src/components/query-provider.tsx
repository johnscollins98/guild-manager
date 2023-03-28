import App from './app';

import axios from 'axios';
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      async queryFn({ queryKey: [url] }) {
        if (typeof url === 'string') {
          const { data } = await axios.get(`/api/${url}`);
          return data;
        }
        throw new Error('Invalid QueryKey');
      }
    }
  }
});

const QueryProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

export default QueryProvider;
