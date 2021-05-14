const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const CepCoords = require("coordenadas-do-cep");

const app = express();

app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(cors({credentials: true, origin: 'http://localhost:4200'}));

// const usersRouter = require('./routes/users');
require('../cantinho-unhas-server/routes/users')(app);

// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/users', usersRouter);

server = app.listen(3003, () => {
    console.log('Servidor online') 
 
   //  CepCoords.getDistEntreCeps("09521000", "09540240")
   //  .then(distancia => {
   //     console.log(distancia)
   //     //retorna o mesmo 'distancia' da versão em promise
   //  })
   //  .catch(err => {
   //     //retorna o mesmo parâmetro 'err' da versão em promise
   //  })
})

// lat: -23.6312,
//   lon: -46.5574 
// lat: -23.6312,
//   lon: -46.5705 }

module.exports = app;
