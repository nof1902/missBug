import express from "express";
import { requireAdmin, requireUser } from "../../middlewares/requireAuth.middle.js";

import {
  getMsgs,
  getMsgById,
  deleteMsg,
  addMsg,
  updateMsg
} from "./msg.controller.js";

const router = express.Router();

router.get('/', getMsgs)
router.get('/:id', getMsgById)
router.post('/', requireUser, addMsg)
router.put('/', requireUser, updateMsg)
router.delete('/:id', requireAdmin, deleteMsg)

export const msgRoutes = router;
