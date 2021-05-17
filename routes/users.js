const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const CepCoords = require("coordenadas-do-cep");

const User = require('../models/user.model');

router.post('/register', async(req, res) => {  
  const body = req.body;
  try{
    await CepCoords.getByCep(req.body.cepUser)
    .then(info => {
      body.latUser = info.lat;
      body.lonUser = info.lon;      
       //retorna o mesmo 'info' da versão em promise
    })
    .catch((error) => {
      return res.status(400).send({ error: 'Invalid Zip Code' });  
       //retorna o mesmo parâmetro 'err' da versão em promise
    })
    const user = await User.create(body);
    user.password = undefined;    
    return res.send({ user });
  }catch(error){
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

router.delete('/deleteUser', async(req, res) =>{ 
  try{
    await User.findOneAndDelete(req.params.emailUser);    
    return res.send();
  }catch(error){
    return res.status(400).send({ error: 'Error deleting user' });    
  }
});

router.put('/updateUser', async(req, res) => {  
  try{
    await CepCoords.getByCep(req.body.cepUser)
    .then(info => {
      req.body.latUser = info.lat;
      req.body.lonUser = info.lon;      
       //retorna o mesmo 'info' da versão em promise
    })
    .catch((error) => {      
      return res.status(400).send({ error: 'Invalid Zip Code' });  
       //retorna o mesmo parâmetro 'err' da versão em promise
    })   
    const user = await User.findOneAndUpdate(
      { emailUser: req.body.emailUser }, 
      { $set: {nameUser: req.body.nameUser,
      emailUser: req.body.emailUser,
      cpfUser: req.body.cpfUser,
      phoneUser: req.body.phoneUser,
      cepUser: req.body.cepUser,
      endUser: req.body.endUser,
      cidUser: req.body.cidUser,
      ufUser: req.body.ufUser,
      nEndUser: req.body.nEndUser,
      photoUser: req.body.photoUser,
      latUser: req.body.latUser,
      lonUser: req.body.lonUser
      }},
      { new: true, useFindAndModify: false });       
    return res.send((user));
  }catch(error){    
    return res.status(400).send({ error: 'Error update user' });    
  }  
});

router.get('/sourceProfessional', async(req, res) => {
  const radius = 0.05;
  const userLat = parseFloat(req.query.latUser);
  const userLon = parseFloat(req.query.lonUser);
  try{
    const userList = await User.find( {
      latUser: { $gt: userLat - radius, $lt: userLat + radius},
      lonUser: { $gt: userLon - radius, $lt: userLon + radius},
      typeUser: true
    }).lean()        
    userList.forEach((professional) => {
      professional.distance = Math.abs(professional.latUser - userLat) + Math.abs(professional.lonUser - userLon) * 111;      
    })
    userList.sort((a,b) => (a.distance> b.distance) ? 1 : ((b.distance> a.distance) ? -1 : 0))    
    setTimeout(() => {
      return res.send((userList));
    }, 1000);    
  }catch(error){    
    return res.status(400).send({ error: 'Error' }); 
  }  
});

module.exports = app => app.use('/users', router);