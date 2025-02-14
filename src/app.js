const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userAlreadyExists = users.find((user) => user.username === username);

  if (!userAlreadyExists) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = userAlreadyExists;

  return next();
}

function checksExistsTodo(request, response, next) {
  const { user } = request;
  const { id } = request.params;

  const todo = user.todos.find((todo) => todo.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo doesn't exist!" });
  }

  request.todo = todo;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const findUser = users.some((user) => user.username === username);

  if (findUser)
    return response.status(400).json({ error: "User already exists!" });

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { todos } = request.user;

  return response.status(200).json(todos);
});

app.put(
  "/todos/:id",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    const { todo } = request;
    const {title, deadline} = request.body;

    todo.title = title;
    todo.deadline = deadline;

    return response.status(201).json(todo);
  }
);

app.patch(
  "/todos/:id/done",
  checksExistsUserAccount,
  checksExistsTodo,
  (request, response) => {
    let { todo } = request;

    todo.done = true

    return response.status(200).json(todo);
  }
);

app.delete("/todos/:id", checksExistsUserAccount,checksExistsTodo, (request, response) => {
  const { user, todo } = request;

  user.todos.splice(todo.id, 1);
  
  return response.status(204).json(user.todos);
});

module.exports = app;
