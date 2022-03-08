import { useContext } from 'react';
import ConfirmContext from './ConfirmDialogContext';
import { ActionTypes } from './ConfirmDialogReducer';

let resolveCallback: (value: boolean) => void;
function useConfirm() {
  const { confirmModalState, dispatch } = useContext(ConfirmContext);

  const onConfirm = () => {
    closeConfirm();
    resolveCallback(true);
  };

  const onCancel = () => {
    closeConfirm();
    resolveCallback(false);
  };
  const confirm = (message?: string, title?: string) => {
    dispatch({
      type: ActionTypes.SHOW,
      payload: {
        show: true,
        message,
        title
      }
    });
    return new Promise((res, _rej) => {
      resolveCallback = res;
    });
  };

  const closeConfirm = () => {
    dispatch({
      type: ActionTypes.HIDE
    });
  };

  return { confirm, onConfirm, onCancel, confirmModalState };
}

export default useConfirm;
