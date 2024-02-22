import { loggerService } from "../../services/logger.service.js";
import { bugService } from "./bug.service.js";
import { authService } from "../auth/auth.service.js";

export async function getBugs(req, res) {
  try {
    const filterBy = {
      title: req.query.title || "",
      severity: req.query.severity || 0,
      label: req.query.label,
      pageIdx: req.query.pageIdx,
    };

    const sortBy = {
      sortLabel: req.query.sortLabel || "",
      direction: req.query.direction || "",
    };

    const bugs = await bugService.query(filterBy, sortBy);

    res.send(bugs);
  } catch (err) { 
    console.log(err);
    res.status(400).send(`Couldn't get all bugs `, err);
    loggerService.error(err)
  }
}

export async function getBugById(req, res) {
  try {
    const arrVisitBugs = req.cookies.arrVisitBugs || [];
    const { bugId } = req.params;
    console.log(arrVisitBugs)
    if (arrVisitBugs.length >= 3 && !arrVisitBugs.includes(bugId)) {
      res.status(400).send(`wait several sec..`);
      return;
    }

    arrVisitBugs.push(bugId);
    const bugToSend = await bugService.getById(bugId);
    res.cookie("arrVisitBugs", arrVisitBugs, { maxAge: 1000 * 7 });
    res.send(bugToSend);
  } catch (err) {
    console.log(err);
    res.status(400).send(`Couldn't get bug `,err);
    loggerService.error(err)
  }
}

export async function addBug(req, res) {
  const { title, severity, description, label} = req.body;
  const bugToSave = { title, severity, description, label};

  try {
    await bugService.save(bugToSave,req.loggedinUser);
    res.send(`bug- ${bugToSave.title} added successfully`);
  } catch (err) {
    res.status(400).send(`Couldn't save bugs `, err);
    loggerService.error(err)
  }
}

export async function removeBug(req, res) {
  try {
    const { bugId } = req.params;

    await bugService.remove(bugId,req.loggedinUser);
    res.send(`bug with id ${bugId} has removed`);
  } catch (err) {
    // res.status(400).send(`Couldn't remove bugs`);
    res.status(err.code).send(`Couldn't remove bugs ${err.msg}`);
    loggerService.error(err)
  }
}

export async function updateBug(req, res) {
  const { _id, title, severity, description, label ,creator} = req.body;
  const bugToSave = { _id, title, severity, description, label ,creator};

  try {
    await bugService.save(bugToSave,req.loggedinUser);
    res.send(`bug- ${title}, changed successfully`);
  } catch (err) {
    res.status(400).send(`Couldn't update bugs`);
    // res.status(400).send(`Couldn't remove bugs ${err.msg}`);
    loggerService.error(err)
  }
}
