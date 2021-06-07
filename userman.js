const express = require('express');
const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

// data structure in runtime memory
const users = [];
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

app.post('/adduser', (req, res) => {
  let {userid, name, email, age} = req.body;
  let user = new User(userid, name, email, age);
  users.push(user);
  console.log(users);
  res.write(`User Added`);
  res.end();
});

app.listen(3000, () => {
  console.log('server listening on port 3000');
});