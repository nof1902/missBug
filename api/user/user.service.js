import { loggerService } from '../../services/logger.service.js'
import { utilService } from '../../services/util.service.js'
import { bugService } from '../bug/bug.service.js'

export const userService = {
    query,
    getById,
    getByUsername,
    remove,
    save
}

const NUM_OF_ITEMS_PER_PAGE = 2
const FILE_PATH = './data/user.json'
const users = utilService.readJsonFile(FILE_PATH)

async function query(){
    try{
        let usersList = [...users]
        // const { fullname, username, score, pageIdx} = filterBy;
        // let totalPages = 1

        // // filter
        // if(fullname){
        //     usersList = usersList.filter(user => user.title.toLowerCase().includes(fullname))
        // }

        // if(username){
        //     usersList = usersList.filter(user => user.title.toLowerCase().includes(fullname))
        // }
    
        // if(score){
        //     usersList = usersList.filter(user => +user.score > score)
        // }

        // // sort
        // if(sortBy.fullname || sortBy.username){
        //     usersList.sort((a, b) => {

        //     const subjectA = a.fullname
        //     const subjectB = b.fullname

        //     if (sortBy.direction === 'asc') {
        //         return subjectA.localeCompare(subjectB)
        //     } else {
        //         return subjectB.localeCompare(subjectA)
        //     }
        // })}

        // if(sortBy.label === ){
        //     usersList.sort((a, b) => {
        //     const valueA = a.severity
        //     const valueB = b.severity

        //     if (sortBy.direction === 'asc') {
        //         return valueA - valueB
        //     } else {
        //         return valueB - valueA
        //     }
        // })}

        // if(pageIdx) {
        //     const startIdx = pageIdx * NUM_OF_ITEMS_PER_PAGE
        //     usersList = usersList.slice(startIdx, startIdx + NUM_OF_ITEMS_PER_PAGE)
        //     totalPages = Math.ceil(usersList.length / NUM_OF_ITEMS_PER_PAGE);
        // }

        return usersList
    } catch(err) {
        loggerService.error(`Had problems getting users...`)
        throw err
    }
}

async function getByUsername(username) {
    const user = users.find(user => user.username === username)
    return user
}

async function getById(userId){
    try{
        const userBugList = await bugService.getBugsByUserId(userId)
        const user = users.find(user => user._id === userId)
        user.userBugList = userBugList
        return {user}
    } catch(err){
        loggerService.error(`Had problems getting user ${userId}...`)
        throw err
    }
}

async function remove(userId){
    try{
        const idx = users.findIndex(user => user._id === userId)
        if(idx < 0) throw 'Could not find user to remove'
        users.splice(idx,1)
        await utilService.saveEntitiesToFile(users,FILE_PATH)
    } catch(err){
        loggerService.error(`Had problems removing user ${userId}...`)
        throw err
    }
}

// check
async function save(userToSave){
    try{
        if(userToSave._id){
            const idx = users.findIndex(user => user._id === userToSave._id)
            const user = users[idx]
            if(idx < 0) throw 'Could not save user',idx
            // userToSave = await authService.encryptPassword(userToSave)
            users.splice(idx,1,{...user, ...userToSave})
        } else {
            loggerService.debug("user.service: creating new user " , userToSave)
            userToSave._id = utilService.makeId()
            userToSave.score = utilService.getRandomIntInclusive(0, 1000)
            userToSave.createdAt = Date.now()
            userToSave.isAdmin = false
            // userToSave = await authService.encryptPassword(userToSave)
            // if (!user.imgUrl) user.imgUrl = 'https://cdn.pixabay.com/photo/2020/07/01/12/58/icon-5359553_1280.png'
            console.log(userToSave)
            users.push(userToSave)
        }
        await utilService.saveEntitiesToFile(users,FILE_PATH)
        return userToSave
    } catch(err){
        loggerService.error(`Had problems saving user ${userToSave._id}...`)
        throw err
    }

}
