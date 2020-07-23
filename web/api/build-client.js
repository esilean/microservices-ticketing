import axios from 'axios'

export default ({ req }) => {
  if (typeof window === 'undefined') {
    // we are on the server
    return axios.create({
      baseURL: process.env.BASE_URL,
      headers: req.headers,
    })
  } else {
    // where are on the browser
    return axios.create({
      baseURL: '/',
    })
  }
}
