import { loggerService } from "../../services/logger.service.js";
import { authService } from "./auth.service.js";

export async function login(req, res) {
  try {
    const { username, password } = req.body
    
    // const user = await authService.login(username, password)
    // const loginToken = authService.getLoginToken(user)
    // loggerService.info('User login:', user)
    const {user, loginToken} = await _login(username,password)

    console.log('login - loginToken', loginToken)
    
    // // sameSite, secure
    res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
    res.json(user)

  } catch (err) {
    loggerService.error('Failed to Login ' + err)
    res.status(401).send({ err: 'Failed to Login : ' + err })
  }
}

export async function signup(req, res) {
  try {
    const credentials = req.body
    const account = await authService.signup(credentials)
    loggerService.debug(`auth.route - new account created: ` + JSON.stringify(account))

    const {user, loginToken} = await _login(credentials.username, credentials.password)
    // const user = await authService.login(credentials.username, credentials.password)
    // loggerService.info('User signup:', user)
    // const loginToken = authService.getLoginToken(user)
    // // sameSite, secure
    res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
    res.json(user)
    

  } catch (err) {
    loggerService.error('Failed to signup ' + err)
    res.status(400).send({ err: 'Failed to signup : ' + err })
  }
}

export async function _login(username,password){
  const user = await authService.login(username, password)
  const loginToken = authService.getLoginToken(user)
  loggerService.info('User login:', user)

  return {user , loginToken}
}

export async function logout(req, res) {
  try {
    const { username } = req.body
    res.clearCookie('loginToken')
    res.send({ msg: `${username} Logged out successfully` })
  } catch (err) {
    es.status(400).send({ err: 'Failed to logout' })
  }
}
