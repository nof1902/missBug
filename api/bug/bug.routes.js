import express from "express";
import { requireUser } from "../../middlewares/requireAuth.middle.js";

import {
  addBug,
  getBugById,
  getBugs,
  removeBug,
  updateBug,
} from "./bug.controller.js";

const router = express.Router();

router.get("/", getBugs);
router.get("/:bugId", getBugById);
router.delete("/:bugId",requireUser, removeBug);
router.post("/", requireUser, addBug);
router.put("/", requireUser,updateBug);

export const bugRoutes = router;
