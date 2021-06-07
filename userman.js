// import modules
const fs = require('fs');
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
  let html = renderUserList();
  response.send(html);
});

// Serve dynamic Edit User Page/View/Form
app.get('/edit/:id', (request, response) => {
  let index = USERS.findIndex(user => user.userid === request.params.id);
  if (index === -1) {
    response.send(`User ID ${request.params.id} Does Not Exist`);
  }
  else {
    let html = renderEditUser(index);
    response.send(html);
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


// ------------ HTML RENDERING FUNCTIONS -------------
// User List HTML
function renderUserList() {
  let htmlHead = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>List Of Users</title>
</head>`;
  let bodyOpen = `
<body>
  <div style="margin:0 auto; border:1px solid gray; width:90%; height:100%; padding:32px;">
    <p><a href="/">Go Back</a></p>
    <h1>List Of Users</h1>
    <ul>`;
  let bodyClose = `
    </ul>
  </div>
</body>
</html>`;
  if (USERS.length === 0) {
    bodyOpen += '<li>There are no users in the database</li>';
  }
  else {  
    USERS.forEach(user => {
      let {userid, name, email, age} = user;
      let listItem = `<li>User ID: ${userid} Name: ${name} Email Address: ${email} Age: ${age} <a href="/edit/${userid}">Edit This User</a></li>`;
      bodyOpen += listItem;
    });
  }
  let htmlBody = bodyOpen + bodyClose;
  return htmlHead + htmlBody;
}
// Edit User HTML
function renderEditUser(index) {
  // let index = USERS.findIndex(user => user.userid === findID);
  let {userid, name, email, age} = USERS[index];
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Edit User ID</title>
</head>
<body>
  <div style="margin:0 auto; border:1px solid gray; width:90%; height:100%; padding:32px;">
    <p><a href="/">Go Back</a></p>
    <h1>Editing User ID ${userid}</h1>
    <form action="/modifyuser/${userid}" method="post">
      <input type="number" name="userid" id="userid" placeholder="${userid}" disabled>
      <input type="text" name="name" id="name" value="${name}" required>
      <input type="email" name="email" id="email" value="${email}" required>
      <input type="number" name="age" id="age" value="${age}" required>
      <input type="submit" value="submit">
    </form>
  </div>
</body>
</html>`;
  return html;
}
