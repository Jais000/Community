const express = require('express');
const app = express();
const cors = require('cors')
require('dotenv').config();
const port = 3000;
const session = require('express-session')
app.use(cors({credentials: true, origin: 'http://localhost:5173'}));
app.use(session({
    secret: 'secret-key', 
    resave: false,  
    saveUninitialized: false,
  }))

var bodyParser = require('body-parser')
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

require('./routes/routes')(app); 

app.listen(port, () => console.log(`Listening on port: ${port}`) );