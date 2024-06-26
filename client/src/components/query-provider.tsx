import App from './app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
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
