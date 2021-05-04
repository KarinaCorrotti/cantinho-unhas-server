const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

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
})

module.exports = app;
