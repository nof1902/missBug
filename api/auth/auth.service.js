import Cryptr from "cryptr";
import bcrypt from "bcrypt";

import { loggerService } from "../../services/logger.service.js";
import { userService } from "../user/user.service.js";

const cryptr = new Cryptr(process.env.SECRET1 || "Secret-Puk-1234");

export const authService = {
  login,
  signup,
  getLoginToken,
  validateToken,
  encryptPassword,
};

async function login(username, password) {
  const user = await userService.getByUsername(username);
  if (!user) throw "Unkown username";

  //  un-comment for real login
  console.log(password === user.password)
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw "Invalid username or password";

  const miniUser = {
    _id: user._id,
    fullname: user.fullname,
    imgUrl: user.imgUrl,
    score: user.score,
    isAdmin: user.isAdmin,
  };
  return miniUser;
}

async function signup({ username, password, fullname }) {
  loggerService.debug(`auth.service - signup with username: ${username}, fullname: ${fullname}`)
    if (!username || !password || !fullname) throw 'Missing required signup information'
    
    const userExist = await userService.getByUsername(username)
    if (userExist) throw 'Username already taken'
    
    const saltRounds = 10
    const hash = await bcrypt.hash(password, saltRounds)
    const newUser = { username, password: hash, fullname }
    loggerService.debug('auth.service: signup ', newUser)
    await userService.save(newUser)
    return newUser
}

function getLoginToken(user) {
  console.log('getLoginToken - ',user)
  const str = JSON.stringify(user);
  const encryptedStr = cryptr.encrypt(str);
  return encryptedStr;
}

function validateToken(token) {
  try {
    const json = cryptr.decrypt(token);
    const loggedinUser = JSON.parse(json);
    return loggedinUser;
  } catch (err) {
    console.log("Invalid login token");
  }
  return null;
}

async function encryptPassword(user) {
  const saltRounds = 10;
  const hash = await bcrypt.hash(user.password, saltRounds);
  return { ...user, password: hash };
}
