import { use } from 'react';
import { FilterStringContext } from '../../components/common/filter-string-provider';

export const useFilterString = () => {
  const [str] = use(FilterStringContext);
  return str.toLowerCase();
};
