import express from 'express';
import database from './database.js';
import CredentialsValidation from './CredentialsValidation.js';
import cors from 'cors'; 

const app = express();
app.use(cors()); 
app.use(express.json());
app.use('/', express.static('./public', {extensions: ['html']}));


app.post('/api/sign-up', async (request, response) => {
  const user_data = request.body;
  try{
    await CredentialsValidation (user_data.email, user_data.password);
    await database.raw(`insert into users (email, password) values ('${user_data.email}','${user_data.password}')`);
    const result = await database.raw(`select * from users order by id desc limit 1`);
    response.status(200);
    response.json(result);
  }   
  catch(error){
    response.status(404);
    response.json(error.message);
  }
});

app.post('/api/log-in', async (request, response) => {
  const user_data = request.body;
  const result = await database.raw(`select email, id from users where email='${user_data.email}' and password='${user_data.password}'`);
  if (result.length != 0){
    response.status(200);
    response.json(result[0]);
  }
  else {
    response.status(404);
    response.json('User not found! Username or password invalid!');
  } 
});

app.post('/api/:userID/trips', async (request, response) => {
  const data_trip = request.body;
  const userID = Number (request.params.userID);
  await database.raw(`insert into trips (date, destination, days, rating, userID)
  values ('${data_trip.date}','${data_trip.destination}',${data_trip.days},${data_trip.rating}, ${userID})`);
  const result = await database.raw(`select * from trips order by id desc limit 1`);
  response.status(200);
  response.json(result);
});


app.get('/api/:userID/trips/', async (request, response) => {
  const userID = Number (request.params.userID);
  const result = await database.raw(`select * from trips where userId = ${userID}`);
  response.status(200);
  response.json(result);
});

app.get('/api/trips', async (request, response) => {
  const result = await database.raw(`select * from trips`);
  response.status(200);
  response.json(result);
});

app.put('/api/trips/:id', async (request, response) => {
  const id = Number(request.params.id);
  const data_trip = request.body;
  await database.raw(`update trips set date ='${data_trip.date}', destination ='${data_trip.destination}', days = ${data_trip.days}, rating = ${data_trip.rating} where id = ${id} `);
  const result = await database.raw(`select * from trips where id = ${id}`);
  response.status(200);
  response.json(result); 
});

app.delete('/api/trips/:id', async (request, response) => {
  const id = request.params.id;
  const result = await database.raw(`delete from trips where id=${id}`);
  if(result.length !== 0) {
    response.status(200);
    response.json(true);  
  }
  else {
    response.status(404);
    response.json(`The trip with id = ${id} does not exist!`);
  }
});
 
const port = 4000;
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});