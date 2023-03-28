import React from 'react';
import { initialState, ModalAction, ModalState } from './confirm-dialog-reducer';

const ConfirmContext = React.createContext<{
  confirmModalState: ModalState;
  dispatch: React.Dispatch<ModalAction>;
}>({ confirmModalState: initialState, dispatch: () => console.error('Empty dispatch called') });

export default ConfirmContext;
