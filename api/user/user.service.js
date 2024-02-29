import { loggerService } from "../../services/logger.service.js";
import { utilService } from "../../services/util.service.js";
import { bugService } from "../bug/bug.service.js";
import { dbService } from "../../services/db.service.js";

export const userService = {
  query,
  getById,
  getByUsername,
  remove,
  add,
  update
};

import mongodb from 'mongodb'
const { ObjectId } = mongodb
const collectionName = 'user'

// const NUM_OF_ITEMS_PER_PAGE = 2;
// const FILE_PATH = "./data/user.json";
// const users = utilService.readJsonFile(FILE_PATH);

async function query() {
    // const criteria = _buildCriteria(filterBy)
    try {
    const collection = await dbService.getCollection(collectionName)
    let users = await collection.find().toArray()
    users = users.map(user => {
        delete user.password
        user.createdAt = new ObjectId(user._id).getTimestamp()
        return user
    })
    return users
    
  } catch (err) {
    loggerService.error(`Had problems getting users...`);
    throw err;
  }
}

async function getByUsername(userName) {
    try{
        const collection = await dbService.getCollection(collectionName)
        const user = await collection.findOne({ username: userName })
        return user;
    } catch(err) {
        loggerService.error(`Had problems getting user ${userName}...`);
        throw err;
    }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection(collectionName)
    const user = await collection.findOne({ _id: new ObjectId(userId) })
    // delete user.password
    return user ;
  } catch (err) {
    loggerService.error(`Had problems getting user ${userId}...`);
    throw err;
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection(collectionName)
    await collection.deleteOne({ _id: new ObjectId(userId) })
  } catch (err) {
    loggerService.error(`Had problems removing user ${userId}...`);
    throw err;
  }
}

async function add(user) {
  try {
    loggerService.debug("user.service: creating new user ", user);
    const userToAdd = _createNewUser(user)

    const collection = await dbService.getCollection(collectionName)
    await collection.insertOne(userToAdd)
    return userToAdd

  } catch (err) {
    loggerService.error(`Had problems saving user ${userToAdd._id}...`);
    throw err;
  }
}

async function update(user) {
  try {
    const userToUpdate = _updateUser(user)
    const collection = await dbService.getCollection(collectionName)
    await collection.updateOne({ _id: userToUpdate._id }, { $set: userToUpdate })
    return userToUpdate
  } catch (err) {
    loggerService.error(`Had problems saving user ${userToUpdate._id}...`);
    throw err;
  }
}

function _createNewUser(user){
    return {
        username: user.username,
        password: user.password,
        fullname: user.fullname,
        score: 100,
        isAdmin: false
        // imgUrl: user.imgUrl? 
    }
}

function _updateUser(user){
    return {
        _id: new ObjectId(user._id),
        fullname: user.fullname,
        // imgUrl: user.imgUrl? 
        // score: user.score
    }
}

// function _buildCriteria(filterBy) {
//     const criteria = {}
//     if (filterBy.minBalance) {
//         criteria.score = { $gte: filterBy.minBalance }
//     }
//     if (filterBy.txt) {
//         const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
//         criteria.$or = [{
//                 username: txtCriteria
//             },
//             {
//                 fullname: txtCriteria
//             }
//         ]
//     }
//     return criteria
// }
