import React from 'react';

import App from './App';

import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();

const QueryProvider = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  );
};

export default QueryProvider;
