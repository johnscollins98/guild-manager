import { createContext, type ReactNode, useState } from 'react';
import { type WarningType } from 'server';

export const SortContext = createContext({
  sortAscending: false,
  setSortAscending: (v: boolean) => {
    console.log(v);
  }
});

export const FilterContext = createContext({
  warningTypesToDisplay: { event: true, informal: true, official: true },
  setWarningTypesToDisplay: (v: Record<WarningType, boolean>) => console.log(v)
});

const SortContextProvider = ({ children }: { children: ReactNode }) => {
  const [sortAscending, setSortAscending] = useState(false);
  return (
    <SortContext.Provider value={{ sortAscending, setSortAscending }}>
      {children}
    </SortContext.Provider>
  );
};

const FilterContextProvider = ({ children }: { children: ReactNode }) => {
  const [warningTypesToDisplay, setWarningTypesToDisplay] = useState<Record<WarningType, boolean>>({
    event: true,
    informal: true,
    official: true
  });

  return (
    <FilterContext.Provider value={{ warningTypesToDisplay, setWarningTypesToDisplay }}>
      {children}
    </FilterContext.Provider>
  );
};

export const WarningLogSettingsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SortContextProvider>
      <FilterContextProvider>{children}</FilterContextProvider>
    </SortContextProvider>
  );
};
