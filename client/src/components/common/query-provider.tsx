import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { type PropsWithChildren } from 'react';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10000,
      throwOnError: true,
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

const QueryProvider = ({ children }: PropsWithChildren) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default QueryProvider;
