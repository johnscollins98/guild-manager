import { useCallback, useRef, useState } from 'react';

const initialState = {
  open: false,
  message: 'Are you sure your want to proceed?',
  title: 'Confirm'
};

export const useConfirmState = () => {
  const [confirmModalState, setConfirmModalState] = useState(initialState);

  const resolveCallback = useRef<{
    resolve: (v: boolean | PromiseLike<boolean>) => void;
    reject: (reason?: string) => void;
  } | null>(null);

  const closeConfirm = useCallback(() => {
    setConfirmModalState({ ...initialState });
  }, []);

  const onResponse = useCallback(
    (res: boolean) => {
      closeConfirm();

      if (resolveCallback.current) {
        resolveCallback.current.resolve(res);
      }
    },
    [closeConfirm]
  );

  const confirm = useCallback(
    (message: string = initialState.message, title: string = initialState.title) => {
      setConfirmModalState({ open: true, message, title });

      return new Promise<boolean>((resolve, reject) => {
        resolveCallback.current = { resolve, reject };
      });
    },
    [setConfirmModalState]
  );

  return { confirm, onResponse, ...confirmModalState };
};
