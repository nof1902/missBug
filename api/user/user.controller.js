import { userService } from "./user.service.js";

export async function getUsers(req, res) {
  try {
    // const filterBy = {
    //   username: req.query.filterBy.username || "",
    //   fullname: req.query.filterBy.fullname || 0,
    //   score: req.query.filterBy.score,
    //   pageIdx: req.query.filterBy.pageIdx
    // };

    // const sortBy = {
    //   username: req.query.sortBy.username || "asc",
    //   fullname: req.query.sortBy.fullname || "asc",
    //   score: req.query.sortBy.fullname || "asc"
    // };

    // const users = await userService.query(filterBy , sortBy)
    const users = await userService.query();

    res.send(users);
  } catch (err) {
    console.log(err);
    res.status(400).send(`Couldn't get all users`);
  }
}

export async function getUserById(req, res) {
  try {
    const { userId } = req.params;
    const userToSend = await userService.getById(userId);
    res.send(userToSend);
  } catch (err) {
    console.log(err);
    res.status(400).send(`Couldn't get user`);
  }
}

export async function addUser(req, res) {
  const { fullname, username, password } = req.body;
  const userToSave = { fullname, username, password };
  try {
    await userService.add(userToSave);
    res.send(`user- ${userToSave.fullname} added successfully`);
  } catch (err) {
    console.log(err);
    res.status(400).send(`Couldn't save user`);
  }
}

export async function removeUser(req, res) {
  try {
    const { userId } = req.params;
    await userService.remove(userId);
    res.send(`user with id ${userId} has removed`);
  } catch (err) {
    console.log(err);
    res.status(400).send(`Couldn't remove user`);
  }
}

export async function updateUser(req, res) {
  const { _id, fullname, username, password, score } = req.body;
  const userToSave = { _id, fullname, username, password, score };
  try {
    await userService.update(userToSave);
    res.send(`user- ${fullname}, changed successfully`);
  } catch (err) {
    console.log(err);
    res.status(400).send(`Couldn't save user`);
  }
}
