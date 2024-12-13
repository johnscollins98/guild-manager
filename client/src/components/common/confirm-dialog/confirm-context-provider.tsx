import React, { use, type PropsWithChildren } from 'react';
import ConfirmDialog from './confirm-dialog';
import { useConfirmState } from './use-confirm-state';

export const ConfirmContext = React.createContext<
  (message?: string, title?: string) => Promise<boolean>
>(() => Promise.reject('Uninitialized Context'));

export const useConfirm = () => use(ConfirmContext);

export const ConfirmContextProvider = ({ children }: PropsWithChildren) => {
  const { confirm, ...dialogState } = useConfirmState();

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog {...dialogState} />
    </ConfirmContext.Provider>
  );
};
