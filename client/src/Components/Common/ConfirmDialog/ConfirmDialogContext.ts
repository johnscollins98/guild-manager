import React from 'react';
import { initialState, ModalAction, ModalState } from './ConfirmDialogReducer';

const ConfirmContext = React.createContext<{
  confirmModalState: ModalState;
  dispatch: React.Dispatch<ModalAction>;
}>({ confirmModalState: initialState, dispatch: () => {} });

export default ConfirmContext;
