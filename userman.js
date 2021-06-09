// import modules
const fs = require('fs');
const path = require('path');
const express = require('express');

// global data structure in runtime memory
const USERS = [];
// user class, instance constructor and method to edit prop values
class User {
  constructor(userid, name, email, age) {
    this.userid = userid
    this.name = name
    this.email = email
    this.age = age
  }
  modProps(nameMod, emailMod, ageMod) {
    this.name = nameMod;
    this.email = emailMod;
    this.age = ageMod;
  }
}

// script startup
// async read from database.json file, parse into objects and push to array
fs.readFile('./database.json', 'utf8', (err, data) => {
  if (err) { 
    console.log('Error reading from ./database.json');
    throw err;
  }
  if (data === '' | data === null) {
    console.log('user database is empty');
  }
  else {
    let jsonData = JSON.parse(data);
    jsonData.forEach( readUser => {
      let {userid, name, email, age} = readUser;
      let user = new User(userid, name, email, age);
      USERS.push(user);
    });
    console.log('USERS loaded from database into runtime memory');
    console.log(USERS);
  }
});

// create the http server app
const app = express();
// Serve Static pages: /index.html homepage and /newuser/index.html form
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// set the render view engine to use pug and the path to our pug files
app.set('views', path.join(__dirname, 'render_views'));
app.set('view engine', 'pug');

// Server Events

// When browser submits new user form data
// browser sends http post request to localhost:3000/adduser
app.post('/adduser', (request, response) => {
  // express parses the recieved form data and makes these props avaliable in request.body
  // I'm just object destructuring here for convinence
  let {userid, name, email, age} = request.body;
  let index = USERS.findIndex(user => user.userid === userid);
  if (index !== -1) {
    response.send(`User With ID: ${userid} Already Exists`);
  }
  else {
    // construct and push an instance of a user object into USERS array
    let user = new User(userid, name, email, age);
    USERS.push(user);
    // write the current data in memory to the database.json file
    saveMemoryToDatabase();
    response.redirect('/');
    response.end();
  }
});

// Serve dynamic User List Page/View
app.get('/list', (request, response) => {
  if (USERS.length === 0){
    response.send('There Are No Users');
  }
  else {
    response.render('userlist', {users: USERS});
  }
});

// Serve dynamic Edit User Page/View/Form
app.get('/edit/:id', (request, response) => {
  let index = USERS.findIndex(user => user.userid === request.params.id);
  if (index === -1) {
    response.send(`User ID ${request.params.id} Does Not Exist`);
  }
  else {
    response.render('edituser', USERS[index]);
    // let html = renderEditUser(index);
    // response.send(html);
  }
});

// Post Request to modify user
app.post('/modifyuser/:id', (request, response) => {
  let index = USERS.findIndex(user => user.userid === request.params.id);
  let {name, email, age} = request.body;
  modifyUser(index, name, email, age);
  response.redirect('/');
  response.end();
});

// Listen for events on port 3000
app.listen(3000, () => {
  console.log('Server started. Listening on port 3000');
});

// function to modify user
function modifyUser(index, nameMod, emailMod, ageMod) {
  let userMod = USERS[index];
  userMod.modProps(nameMod, emailMod, ageMod);
  saveMemoryToDatabase();
}

// function to write memory to database.json
function saveMemoryToDatabase() {
  const stringData = JSON.stringify(USERS);
  fs.writeFile('./database.json', stringData, 'utf8', (err) => {
    if (err) { 
      console.log('Error writing to ./database.json');
      throw err;
    }
    console.log('Database successfully written to');
  });
}



