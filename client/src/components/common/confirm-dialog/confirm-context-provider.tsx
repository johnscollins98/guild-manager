import { useReducer } from 'react';
import ConfirmContext from './confirm-dialog-context';
import { initialState, reducer } from './confirm-dialog-reducer';

interface Props {
  children: React.ReactNode;
}

export const ConfirmContextProvider = ({ children }: Props) => {
  const [confirmModalState, dispatch] = useReducer(reducer, initialState);

  return (
    <ConfirmContext.Provider value={{ confirmModalState, dispatch }}>
      {children}
    </ConfirmContext.Provider>
  );
};
