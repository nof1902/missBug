import { loggerService } from "../../services/logger.service.js";
import { utilService } from "../../services/util.service.js";

export const bugService = {
  query,
  getById,
  remove,
  save,
  getBugsByUserId
};

const NUM_OF_ITEMS_PER_PAGE = 2;
const FILE_PATH = "./data/bug.json";
const bugs = utilService.readJsonFile(FILE_PATH);

async function query(filterBy, sortBy) {
  try {
    let bugsList = [...bugs];
    const { title, severity, label, pageIdx } = filterBy;

    // let totalPages = 1

    // filter
    if (title) {
      bugsList = bugsList.filter((bug) =>
        bug.title.toLowerCase().includes(title)
      );
    }

    if (severity) {
      bugsList = bugsList.filter((bug) => +bug.severity > severity);
    }

    if (label !== "all" && label !== "") {
      bugsList = bugsList.filter((bug) => bug.label === label);
    }

    // sort
    if (sortBy.sortLabel === "title") {
      bugsList.sort((a, b) => {
        const subjectA = a[sortBy.sortLabel];
        const subjectB = b[sortBy.sortLabel];

        if (sortBy.direction === "asc") {
          return subjectA.localeCompare(subjectB);
        } else {
          return subjectB.localeCompare(subjectA);
        }
      });
    }

    if (sortBy.sortLabel === "severity") {
      bugsList.sort((a, b) => {
        const valueA = a.severity;
        const valueB = b.severity;

        if (sortBy.direction === "asc") {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    }

    if (pageIdx) {
      const startIdx = pageIdx * NUM_OF_ITEMS_PER_PAGE;
      bugsList = bugsList.slice(startIdx, startIdx + NUM_OF_ITEMS_PER_PAGE);
      // totalPages = Math.ceil(bugsList.length / NUM_OF_ITEMS_PER_PAGE);
    }

    return bugsList;
  } catch (err) {
    loggerService.error(`Had problems getting bugs...`);
    throw err;
  }
}

async function getById(bugId) {
  try {
    return bugs.find((bug) => bug._id === bugId);
  } catch (err) {
    loggerService.error(`Had problems getting bug ${bugId}...`);
    throw err;
  }
}

async function remove(bugId,loggedinUser) {
  try {
    const idx = bugs.findIndex((bug) => bug._id === bugId);
    if (idx < 0) throw "Could not find bug to remove";

    console.log('remove - ' ,loggedinUser)

    // authoritisaion
    const currBug = bugs[idx]
    if(!loggedinUser.isAdmin && currBug.creator._id !== loggedinUser?._id) throw {msg: 'Not your bug', code: 403}

    bugs.splice(idx, 1);
    await utilService.saveEntitiesToFile(bugs, FILE_PATH);
  } catch (err) {
    loggerService.error(`Had problems removing bug ${bugId}...`);
    throw err;
  }
}

async function save(bugToSave,loggedinUser) {
  try {
    if (bugToSave._id) {
      const idx = bugs.findIndex((bug) => bug._id === bugToSave._id);
      if (idx < 0) throw "Could not save bug";

    // authoritisaion
    const currBug = bugs[idx]
    if(!loggedinUser?.isAdmin && currBug.creator._id !== loggedinUser?._id) throw {msg: 'Not your bug', code: 403}

      bugs.splice(idx, 1, {...currBug, ...bugToSave});
    } else {
      bugToSave._id = utilService.makeId();
      bugToSave.createdAt = new Date();
      bugToSave.creator = { _id : loggedinUser._id , fullname: loggedinUser.fullname }
      bugs.push(bugToSave);
    }
    await utilService.saveEntitiesToFile(bugs, FILE_PATH);
  } catch (err) {
    loggerService.error(`Had problems saving bug ${bugToSave._id}...`);
    throw err;
  }
}

async function getBugsByUserId(userId) {
  try {
    const bugsList = bugs.filter((bug) => bug.creator._id === userId)
    console.log(bugsList)
    return bugsList
  } catch (err) {
    loggerService.error(`Had problems getting bugs list for user ${userId}...`);
    throw err;
  }
}
