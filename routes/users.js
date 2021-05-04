const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');

router.post('/register', async(req, res) => {  
  try{
    const user = await User.create(req.body);
    user.password = undefined;
    console.log(user);
    return res.send({ user });
  }catch(error){
    console.log(error);
    return res.status(400).send({ error: 'Registration failed' });    
  }
});

router.post('/authenticate', async(req, res) =>{
    const { emailUser, password } = req.body;
    const user = await User.findOne({emailUser}).select('+password');
  if(!user)
    return res.status(400).send({error: 'User not found'});
  if(!await bcrypt.compare(password, user.password))
   return res.status(400).send({error: 'Invalid password'});
  res.send({user});
});

router.delete('/', async(req, res) =>{ 
  try{
    await User.findOneAndDelete(req.params.emailUser);
    
    return res.send();
  }catch(error){
    console.log(error);
    return res.status(400).send({ error: 'Error deleting user' });    
  }
});

router.put('/', async(req, res) => {
  console.log(req.body.emailUser);
  console.log(req.body);
  try{
    

    const user = await User.findOneAndUpdate(
      { emailUser: req.body.emailUser }, 
      { $set: {nameUser: req.body.nameUser} },
      { new: true, useFindAndModify: false });
      console.log(user);
    // await user.save();    
    return res.send((user));
  }catch(error){
    console.log(error);
    return res.status(400).send({ error: 'Error update user' });    
  }

});

module.exports = app => app.use('/users', router);