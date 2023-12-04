import axios from 'axios'

// Default config
const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL,
});

// Add in request interceptors
api.interceptors.request.use(function (config) {
  try {
    const token = window.localStorage.getItem('accessToken')

    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
  } catch (err) {
    console.log('Error fetching token');
  }
  return config;
});

// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response.status === 422) {
      error.message = `${Object.keys(error.response.data).map(err =>
        error.response.data[err].length > 0
          ? error.response.data[err][0]
          : error.response.data[err],
      )}`;
    } else if (error.response.status === 403) {
      // console.log(error.response)
      error.message = error.response.data.message;
    } else {
      // console.log('error: ', error.response.data.message)

      if (
        error.response.data.message &&
        error.response.data.message.length > 0 &&
        error.response.data.message[0].messages.length > 0
      ) {
        error.message = error.response.data.message[0].messages[0].message;
      } else {
        error.message =
          error.response.data.message || error.response.data.error;
      }
    }
    alert(error.message);
    return Promise.reject(error);
  },
);

export default api;