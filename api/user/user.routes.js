import express from 'express'
import { addUser, getUserById, getUsers, removeUser, updateUser } from './user.controller.js'
import { requireAdmin } from '../../middlewares/requireAuth.middle.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:userId', getUserById)
router.delete('/:userId',requireAdmin, removeUser)
router.post('/',requireAdmin, addUser)
router.put('/',requireAdmin, updateUser)

export const userRoutes = router 