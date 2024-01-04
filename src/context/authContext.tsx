import React, { createContext, useContext, useReducer, useEffect } from 'react'
import PropTypes from 'prop-types';
import reducer, { initialState } from './authReducer'
import type { AuthState} from './authReducer'
import AuthAPI from '../api/auth'

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  ...initialState,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
});

export const AuthProvider: React.FC<AuthProviderProps> = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async (): Promise<void> => {
      try {
        const accessToken = window.localStorage.getItem('accessToken');

        if (accessToken) {
          const response = await AuthAPI.me();

          dispatch({
            type: 'AUTH_INIT',
            payload: {
              loggedIn: true,
              user: response.data,
            },
          });
        } else {
          dispatch({
            type: 'AUTH_INIT',
            payload: {
              loggedIn: false,
              user: null,
            },
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: 'AUTH_INIT',
          payload: {
            loggedIn: false,
            user: null,
          },
        });
      }
    };

    initialize();
  }, []);

  const login = async (identifier: string, password: string): Promise<void> => {
    dispatch({
      type: 'AUTH_LOADING',
    })
    try {
      const response = await AuthAPI.login({ identifier, password})

      localStorage.setItem('accessToken', response.data.jwt)

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: {
          token: response.data.jwt,
          user: response.data.user
        }
      })
    } catch (err: any) {
      // alert(err)
      localStorage.removeItem('accessToken');
      console.error(err)
      dispatch({
        type: 'AUTH_FAILED',
        payload: {
          error: err.message
        }
      })
    }
  }

  const logout = async (): Promise<void> => {
    localStorage.removeItem('accessToken');
    dispatch({ type: 'AUTH_LOGOUT' });
  }
  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext)