const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const CepCoords = require("coordenadas-do-cep");

const User = require('../models/user.model');
const { TooManyRequests } = require('http-errors');

router.post('/register', async(req, res) => {  //recebe um parametro com os dados do usuario e registra no banco de dados
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

router.post('/authenticate', async(req, res) =>{ //recebe um parametro com email e senha do usuario e faz a validação
    const { emailUser, password } = req.body;
    const user = await User.findOne({emailUser}).select('+password');
  if(!user)
    return res.status(400).send({error: 'User not found'});
  if(!await bcrypt.compare(password, user.password))
   return res.status(400).send({error: 'Invalid password'});
  res.send({user});
});

router.delete('/deleteUser', async(req, res) =>{ //recebe um parametro com email do usuario para deletar do banco de dados
  try{
    await User.findOneAndDelete(req.params.emailUser);    
    return res.send();
  }catch(error){
    return res.status(400).send({ error: 'Error deleting user' });    
  }
});

router.put('/updateUser', async(req, res) => {  //recebe um parametro dados do usuario para serem alterados
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

router.get('/sourceProfessional', async(req, res) => { //recebe um parametro com a lat e lon do usuario para fazer busca dos profissionais mais proximos
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

router.get('/availableSchedule', async(req, res) => {   //rota de retorno dos horários disponiveis da profissional
  const getDate = new Date().getDate() + 1;
  const getMonth = (new Date().getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
  const getHours = new Date().getHours() + 1; 
  let availableSchedule = [];
   
  try {
    const user = await User.findOne(
      { emailUser: req.query.emailProfessional }
    )    
    for (let index = parseInt(getDate); index <= parseInt(getDate) + 7; index++) {  
      const hours = [11,13,14,15,16,17];    
      const dayIndex = index.toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}); 
      user.schedule.forEach((day) => {
        if (day.date === `${dayIndex}/${getMonth}`){          
          const index = hours.indexOf(day.hour);                  
          if (index > -1) { hours.splice(index, 1) }
        }
      })
      availableSchedule.push({
        date: `${dayIndex}/${getMonth}`,   
        hours,
      })    
    } 
    
    return res.send(availableSchedule);
  } catch (error) {
    
  }
});

router.post('/schedule', async(req, res) => {   //rota para gravação na agenda do usuario cliente e usuario profissionaç
  try{
    const user = await User.updateMany(
      { emailUser: { $in: [ req.body.emailUser, req.body.emailProfessional ] } }, 
      { $push: {'schedule': {
       date: req.body.date,
       hour: req.body.hour,
       service: req.body.service,
       description: req.body.description,
       client: req.body.emailUser,
       professional: req.body.emailProfessional
      }}},
      { new: true, useFindAndModify: false });       
      return res.status((204));
  }catch(error){
    return res.status(400).send({ error: 'Registration failed' });        
  }
});

module.exports = app => app.use('/users', router);