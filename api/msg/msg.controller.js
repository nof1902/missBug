import { loggerService } from "../../services/logger.service.js";
import { bugService } from "../bug/bug.service.js";
import { msgService } from "../msg/msg.service.js";

export async function getMsgs(req, res) {
  try {
    const filterBy = {
      byUserId: req.query.byUserId || "",
      _id: req.query._id || "",
      aboutBugId: req.query.aboutBugId || ""
    }
    const msgs = await msgService.query(filterBy);
    res.send(msgs);
  } catch (err) {
    loggerService.error("Cannot get msgs", err);
    res.status(400).send({ err: "Failed to get msgs" });
  }
}

export async function getMsgById(req, res) {
  try {
    const msgId = req.params.id
    const msg = await msgService.getById(msgId);
    res.send(msg);
  } catch (err) {
    loggerService.error("Cannot get msgs", err);
    res.status(400).send({ err: "Failed to get msgs" });
  }
}

export async function deleteMsg(req, res) {
  try {
    const deletedCount = await msgService.remove(req.params.id);
    res.send({ msg: "Deleted successfully", deletedCount });
  } catch (err) {
    loggerService.error("Failed to delete msg", err);
    res.status(400).send({ err });
  }
}

export async function updateMsg(req, res) {
  try {
    const { loggedinUser } = req;
    let msg = req.body;
    msg = await msgService.update(msg,loggedinUser)
    res.send({ msg })
  } catch (err) {
    loggerService.error("Failed to delete msg", err);
    res.status(400).send({ err });
  }
}

export async function addMsg(req, res) {
  try {
    let { loggedinUser } = req;
    let msg = req.body;
    
    msg.byUserId = loggedinUser._id;
    msg = await msgService.add(msg);
    msg = await _setMsgToSend(msg, loggedinUser)

    res.send(msg);
  } catch (err) {
    loggerService.error("Failed to add msg", err);
    res.status(400).send({ err: "Failed to add msg" });
  }
}

function _getfilterFormat(){
  return {
    _id:'',
    byUserId:''
  }
}


// prepare the msg for sending out**
async function _setMsgToSend(msg, loggedinUser){

  const {_id , title , severity} = await bugService.getById(msg.aboutBugId);
  msg.aboutBug = {_id , title , severity} 
  msg.byUser = {_id: loggedinUser._id, fullname: loggedinUser.fullname};

  delete msg.aboutUserId;
  delete msg.byUserId;

  return msg;
}
