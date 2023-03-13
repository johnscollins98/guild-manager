import { useSearchParams } from 'react-router-dom';

export const useFilterString = () => {
  const [searchParams] = useSearchParams();
  const str = searchParams.get('filterString') ?? '';
  return str.toLowerCase();
};
