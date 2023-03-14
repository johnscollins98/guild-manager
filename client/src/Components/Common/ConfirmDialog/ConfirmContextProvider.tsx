import { useReducer } from 'react';
import { initialState, reducer } from './ConfirmDialogReducer';
import ConfirmContext from './ConfirmDialogContext';

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
