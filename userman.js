// import modules
const fs = require('fs');
const express = require('express');

// global data structure in runtime memory
const USERS = [];
// user class, instance constructor and method to edit prop values
class User {
  constructor(userid, name, email, age){
    this.userid = userid
    this.name = name
    this.email = email
    this.age = age
  }
  setProp(prop, value){
    this[prop] = value;
  }
}

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
    jsonData.forEach( user => {
      USERS.push(user);
    });
    console.log('USERS loaded from database into runtime memory');
    console.log(USERS);
  }
});

// create the http server app
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// Server Events
// When browser submits new user form data
// browser sends http post request to localhost:3000/adduser
app.post('/adduser', (request, response) => {
  // express parses the recieved form data and makes these props avaliable in request body
  // I'm just object destructuring here for convinence
  let {userid, name, email, age} = request.body;
  // construct and push an instance of a user object into USERS array
  let user = new User(userid, name, email, age);
  USERS.push(user);
  // write the current data in memory to the database.json file
  const stringData = JSON.stringify(USERS);
  fs.writeFile('./database.json', stringData, 'utf8', (err) => {
    if (err) { 
      console.log('Error writing to ./database.json');
      throw err;
    }
    console.log('Database successfully written to');
  });
  response.write(`User Added`);
  response.end();
});

// Listen for events on port 3000
app.listen(3000, () => {
  console.log('Server started. Listening on port 3000');
});