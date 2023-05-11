export enum ActionTypes {
  SHOW = 'SHOW_MODAL',
  HIDE = 'HIDE_MODAL'
}

export interface ModalState {
  show: boolean;
  message?: string;
  title?: string;
}

export interface ModalAction {
  type: ActionTypes;
  payload?: ModalState;
}

export const initialState: ModalState = {
  show: false,
  message: 'Are you sure your want to proceed?',
  title: 'Confirm'
};

export const reducer = (state = initialState, action: ModalAction) => {
  switch (action.type) {
    case ActionTypes.SHOW:
      return { ...state, ...action.payload, show: true };
    case ActionTypes.HIDE:
      return { ...state, ...action.payload, show: false };
    default:
      return state;
  }
};
