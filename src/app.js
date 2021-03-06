const express = require("express");
const cors = require("cors");
const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function logRequests(request, response,next){
  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;
  console.log(logLabel);
  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

function  ValidateRepositoryID(request, response , next){
  const{ id } = request.params;

  if (!isUuid(id)){
    return response.status(400).json({ error: 'Invalid Repository ID.'});
  }
  return next();
}

app.use(logRequests);

app.get("/repositories", (request, response) => {
  const { title } = request.query;
  const results = title
    ? repositories.filter(repository => repository.title.includes(title))
    : repositories;
  
  return response.json(results);
});

app.post("/repositories", (request, response) => {
  const{ title , url, techs} = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes:0
  };
  repositories.push(repository);

  return response.json(repository);

});

app.put("/repositories/:id",ValidateRepositoryID, (request, response) => {
  const {id} = request.params;
  const {title, url, techs} = request.body;

  const repositoryIndex=  repositories.findIndex( repository => repository.id === id);

  if (repositoryIndex < 0){
    return response.status(400).json({error: "Repository not found" });
  }

  repositories[repositoryIndex].title = title;
  repositories[repositoryIndex].url = url;
  repositories[repositoryIndex].techs = techs;

  return response.json(repositories[repositoryIndex]);

});

app.delete("/repositories/:id", ValidateRepositoryID,(request, response) => {
  const {id} = request.params;
  const repositoryIndex=  repositories.findIndex( repository => repository.id === id);

  if (repositoryIndex < 0){
    return response.status(400).json({error: "Repository not found" });
  }

  repositories.splice(repositoryIndex,1);

  return response.status(204).send();

});

app.post("/repositories/:id/like", ValidateRepositoryID,(request, response) => {
  const {id} = request.params;
  const repositoryIndex=  repositories.findIndex( repository=> repository.id === id);
  if (repositoryIndex < 0){
    return response.status(400).json({error: "Repository not found" });
  }
  repositories[repositoryIndex].likes += 1;
  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
