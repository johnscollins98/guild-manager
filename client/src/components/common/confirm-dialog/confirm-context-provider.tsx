import { useReducer } from 'react';
import { initialState, reducer } from './confirm-dialog-reducer';
import ConfirmContext from './confirm-dialog-context';

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
