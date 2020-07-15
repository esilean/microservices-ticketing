import buildClient from '../api/build-client'

const LandingPage = ({ currentUser }) => {
  return currentUser ? <h4>You are signed in</h4> : <h4>You are not signed in</h4>
}

LandingPage.getInitialProps = async (context) => {
  const { data } = await buildClient(context).get('/api/users/currentuser')
  return data
}

export default LandingPage
