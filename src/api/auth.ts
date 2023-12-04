import api from './config'

const login = (params: {identifier: string, password: string}) => {
  return api.post('/auth/local', {...params});
};

const me = () => {
  return api.get('/users/me');
};

export default {
  login,
  me,
};