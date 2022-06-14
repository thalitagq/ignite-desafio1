const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const user = users.find((user) => user.username === username);

  if (user) {
    request.user = user;
    next();
  }
  else {
    response.status(404).send({ error: "User not found" });
  }
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExists = users.some((user) => user.username === username)

  if (userExists) {
    response.status(400).send({error: "User already exists"})
  }
  else {
    const user = {
      id: uuidv4(),
      name,
      username,
      todos: [],
    };
  
    users.push(user);
  
    response.status(201).send(user);
  }

});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  response.status(200).send(request.user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  request.user.todos.push(todo);
  response.status(201).send(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todo = request.user.todos.find((item) => item.id === id);

  if(!todo){
    response.status(404).send({error: "Todo not found"})
  }
  else {
    if (title) {
      todo.title = title;
    }
  
    if (deadline) {
      todo.deadline = new Date(deadline);
    }
  
    response.status(200).send(todo);
  }

});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;

  const todo = request.user.todos.find((item) => item.id === id);

  if (!todo) {
    response.status(404).send({ error: "Todo not found" });
  }
  else{
    todo.done = true
  
    response.status(200).send(todo);
  }

});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request
  const indexToDo = user.todos.findIndex((item) => item.id === id);

  if (indexToDo < 0 ) {
    response.status(404).send({ error: "Todo not found" });
  }
  else {
    user.todos = user.todos
      .slice(0, indexToDo)
      .concat(user.todos.slice(indexToDo + 1));
  
    response.sendStatus(204)
  }
});

module.exports = app;
