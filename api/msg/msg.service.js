import { dbService } from "../../services/db.service.js";
import { loggerService } from "../../services/logger.service.js";
import { utilService } from "../../services/util.service.js";

import mongodb from "mongodb";
const { ObjectId } = mongodb;
const collectionName = "msg";

export const msgService = {
  query,
  getById,
  remove,
  add,
  update
};


async function query(filterBy = {}) {
  try {
    const criteria = _buildCriteria(filterBy);
    const collection = await dbService.getCollection(collectionName);
    var msgs = await collection
      .aggregate([
        {
          $match: criteria,
        },
        {
          $lookup: {
            localField: "byUserId",
            from: "user",
            foreignField: "_id",
            as: "byUser",
          },
        },
        {
          $unwind: "$byUser",
        },
        {
          $lookup: {
            localField: "aboutBugId",
            from: "bug",
            foreignField: "_id",
            as: "aboutBug",
          },
        },
        {
          $unwind: "$aboutBug",
        },
        {
          $project: {
            _id: true,
            txt: true,
            "byUser._id": true,
            "byUser.fullname": true,
            "aboutBug._id": true,
            "aboutBug.title": true,
            "aboutBug.severity": true,
          },
        },
      ])
      .toArray();

    return msgs;
  } catch (err) {
    loggerService.error("cannot find msgs", err);
    throw err;
  }
}

// different option - 3-find by ID for 3 entities separate0
async function getById(msgId){
    try{
        const filterBy = {
            _id : msgId
        }
        const msg = await query(filterBy)
        return msg
    }catch(err){
        loggerService.error("cannot get the msg", err);
        throw err;
    }
}

async function remove(msgId) {
  try {
    const collection = await dbService.getCollection("msg");
    const criteria = { _id: new ObjectId(msgId) };
    const { deletedCount } = await collection.deleteOne(criteria);
    if (deletedCount < 1) throw "Cannot remove msg";
    return deletedCount;
  } catch (err) {
    loggerService.error(`cannot remove msg ${criteria}`, err);
    throw err;
  }
}

async function update(msg, loggedinUser) {
    try {
        const collection = await dbService.getCollection("msg");
        const msgFromDb = await collection.findOne({_id: new ObjectId(msg._id)}) //  const msgFromDb = getById(msgId) ?
        if (loggedinUser._id !== msgFromDb.byUserId.toString()) {
          loggerService.warn(`logged in user = ${loggedinUser._id} - authentication failure`);
          throw "can not edit messages that are not yours" 
        }
        const fieldToUpdate = {txt : msg.txt}
        const updatedMsg = await collection.updateOne({_id: new ObjectId(msg._id)},{$set: {...fieldToUpdate}});
        return updatedMsg
    } catch (err) {
      loggerService.error("cannot insert msg", err);
      throw err;
    }
  }
  
async function add(msg) {
  try {
    const msgToAdd = {
      byUserId: new ObjectId(msg.byUserId),
      aboutBugId: new ObjectId(msg.aboutBugId),
      txt: msg.txt
    };
    const collection = await dbService.getCollection("msg");
    await collection.insertOne(msgToAdd);

    return msgToAdd;
  } catch (err) {
    loggerService.error("cannot insert msg", err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.byUserId) criteria.byUserId = new ObjectId(filterBy.byUserId);
  if(filterBy._id) criteria._id = new ObjectId(filterBy._id)
  if(filterBy.aboutBugId) criteria.aboutBugId = new ObjectId(filterBy.aboutBugId)
  return criteria;
}
