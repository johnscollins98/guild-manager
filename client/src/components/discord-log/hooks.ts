import { useFilterString } from '../../lib/utils/use-filter-string';

export const useIsFiltered = (text: string, details?: string[]) => {
  const filterText = useFilterString();
  return (
    text.toLowerCase().includes(filterText) || details?.some(d => d.toLowerCase().includes(text))
  );
};
