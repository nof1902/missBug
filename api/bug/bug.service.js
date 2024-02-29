import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";
import { utilService } from "../../services/util.service.js";

export const bugService = {
  query,
  getById,
  remove,
  getBugsByUserId,
  update,
  add,
  addBugMsg,
  deleteBugMsg
};

import mongodb from 'mongodb'
import { msgService } from "../msg/msg.service.js";
const { ObjectId } = mongodb
const collectionName = 'bug'
const PAGE_SIZE = 2;


async function query(filterBy, sortBy) {
  try {
    const {fCriteria, sCriteria} = _buildCriteria(filterBy, sortBy)

    const collection = await dbService.getCollection(collectionName)
    let bugCursor = await collection.find(fCriteria).sort(sCriteria)

    // if (filterBy.pageIdx !== undefined) {
    //   const startIdx = filterBy.pageIdx * PAGE_SIZE
    //   bugCursor.skip(startIdx).limit(PAGE_SIZE)
    // }

    const bugs = bugCursor.toArray() 
    return bugs
  } catch (err) {
    loggerService.error(`Had problems getting bugs...`);
    throw err;
  }
}

async function getById(bugId) {
  try {
    const collection = await dbService.getCollection(collectionName)
    let bug = await collection.findOne({_id: new ObjectId(bugId)})

    bug.messages = await msgService.query({aboutBugId: new ObjectId(bugId)})
    bug.messages = bug.messages.map(msg => {
      delete msg.aboutBug
      return msg
  })
  
  return bug
  } catch (err) {
    loggerService.error(`Had problems getting bug ${bugId}...`);
    throw err;
  }
}

async function remove(bugId, loggedinUser) {
  try {
    // authoritisaion
    const currBug = await getById(bugId) 
    if (!loggedinUser.isAdmin && currBug.creator._id !== loggedinUser?._id)
      throw { msg: "Not your bug", code: 403 };

    const collection = await dbService.getCollection(collectionName)
    const { deletedCount } = await collection.deleteOne({ _id: new ObjectId(bugId) })
    if(deletedCount < 1) throw `Had problems removing bug ${bugId}...`
    return deletedCount
  } catch (err) {
    loggerService.error(`Had problems removing bug ${bugId}...`);
    throw err;
  }
}

async function update(bug, loggedinUser) {
  try {
    // authoritisaion
    if (!loggedinUser?.isAdmin && bug.creator._id !== loggedinUser?._id) {
      throw { msg: "Not your bug", code: 403 };
    }
    
    const bugToSave = updateBugsFelid(bug)
    const collection = await dbService.getCollection(collectionName)
    const res = await collection.updateOne({ _id: new ObjectId(bug._id) }, { $set: bugToSave })
    if(res.modifiedCount < 1) throw 'Could not update car'
    return bug
  } catch (err) {
    loggerService.error(`Had problems saving bug ${bug._id}...`);
    throw err;
  }
}

async function add(bugToSave, loggedinUser) {
  try {
    bugToSave.createdAt = new Date();
    bugToSave.creator = {
      _id: loggedinUser._id,
      fullname: loggedinUser.fullname,
    };
    const collection = await dbService.getCollection(collectionName)
    await collection.insertOne(bugToSave)
    return bugToSave
  } catch (err) {
    loggerService.error(`Had problems saving bug ${bugToSave._id}...`);
    throw err;
  }
}

async function getBugsByUserId(userId) {
  try {
    const bugsList = bugs.filter((bug) => bug.creator._id === userId);
    console.log(bugsList);
    return bugsList;
  } catch (err) {
    loggerService.error(`Had problems getting bugs list for user ${userId}...`);
    throw err;
  }
}

async function addBugMsg(bugId, msg, loggedinUser) {
  try {
    // save message at msg-DB
    const toMsgDB = {
      txt: msg.txt,
      byUserId: loggedinUser._id,
      aboutBugId: bugId
    }
    const addedMsg = await msgService.add(toMsgDB)
  
    // save message at messages field at bug-DB
    const toBugDB = {
      id: addedMsg._id,
      txt: msg.txt,
      byUser: {_id: new ObjectId(loggedinUser._id), 
        fullname: loggedinUser.fullname}
    }
    const collection = await dbService.getCollection(collectionName)
    await collection.updateOne({_id: new ObjectId(bugId)},{ $push: {messages: toBugDB}})
    return toBugDB
  } catch (err) {
    loggerService.error(`Had problems saving Msg at bug ${bugId}...`);
    throw err;
  }
}

async function deleteBugMsg(bugId, msgId) {
  try {
    const deletedCount = await msgService.remove(msgId) 
    if(deletedCount < 1) throw `Had problems removing bug ${bugId}...`

    const collection = await dbService.getCollection(collectionName)
    await collection.updateOne({ _id: new ObjectId(bugId) }, { $pull: { msgs: { id: msgId } } })

    return deletedCount
  } catch (err) {
    loggerService.error(`Had problems removing bug ${bugId}...`);
    throw err;
  }
}


function updateBugsFelid(bug){
  return {
    title: bug.title,
    severity: bug.severity,
    description: bug.description,
    label: bug.label
  }
}

function _buildCriteria(filterBy,sortBy) {
  const fCriteria = {}

  if (filterBy.title) {
      fCriteria.title = { $regex: filterBy.title, $options: 'i' }
  }

  if (filterBy.severity) {
      fCriteria.severity = { $gt: parseInt(filterBy.severity, 10) }
  }

  if (filterBy.label !== "all" && filterBy.label !== "") {
    fCriteria.label = filterBy.label 
  }

  const sCriteria = {};

  if (sortBy.sortLabel && sortBy.direction) {
    sCriteria[sortBy.sortLabel] = sortBy.direction
  }

  return { fCriteria, sCriteria };
}
