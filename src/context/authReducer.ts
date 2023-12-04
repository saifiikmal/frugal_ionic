interface User {
  id: string;
  email: string;
  username: string;
  [key: string]: any;
}
export interface AuthState {
  token: string | null;
  user: User | null;
  loggedIn: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthAction {
  type: string;
  payload?: any;
}
export const initialState: AuthState = {
  token: null,
  user: null,
  loggedIn: false,
  loading: false,
  error: null,
};

const reducer = (state: AuthState, action: AuthAction) => {
  switch (action.type) {
    case 'AUTH_INIT':
      return {
        ...state,
        loggedIn: action.payload.loggedIn,
        user: action.payload.user,
        loading: false,
      }
      break;
    case 'AUTH_LOADING':
      return { 
        ...state, 
        error: null, 
        loading: true
      }
      break;
    case 'AUTH_SUCCESS':
      return { 
        ...state,
        token: action.payload.token,
        loggedIn: true,
        user: action.payload.user,
        error: null, 
        loading: false
      }
      break;
    case 'AUTH_FAILED':
      return { 
        ...state,
        token: null,
        loggedIn: false,
        user: null,
        error: action.payload.error, 
        loading: false
      }
      break;
    case 'AUTH_LOGOUT':
      return initialState
      break;
    default:
      return state
  }
}
export default reducer;