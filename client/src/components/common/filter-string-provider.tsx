import React, { type Dispatch, type ReactNode, type SetStateAction, useState } from 'react';

export const FilterStringContext = React.createContext<[string, Dispatch<SetStateAction<string>>]>([
  '',
  v => console.log(v)
]);

export const FilterStringProvider = ({ children }: { children: ReactNode }) => {
  const filterStringState = useState<string>('');
  return (
    <FilterStringContext.Provider value={filterStringState}>
      {children}
    </FilterStringContext.Provider>
  );
};
