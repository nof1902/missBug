import express from "express";
import { requireAdmin, requireUser } from "../../middlewares/requireAuth.middle.js";

import {
  addBug,
  getBugById,
  getBugs,
  removeBug,
  updateBug,
  addBugMsg,
  removeBugMsg
} from "./bug.controller.js";

const router = express.Router();

router.get("/", getBugs);
router.get("/:bugId", getBugById);
router.delete("/:bugId",requireUser, removeBug);
router.post("/", requireUser, addBug);
router.put("/", requireUser,updateBug);

router.post("/:bugId/msg", requireUser, addBugMsg);
router.delete("/:bugId/msg/:msgId",requireAdmin, removeBugMsg);

export const bugRoutes = router;
