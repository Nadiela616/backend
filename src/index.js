import express, { response } from 'express';
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
  const data = request.body;
  const userID = Number (request.params.userID);
  await database.raw(`insert into trips (date, destination,description,days,rating,latitude,longitude,country,user_id)
  values ('${data.date}','${data.destination}','${data.description}',${data.days},${data.rating},${data.lat},${data.lon},'${data.country}',${userID})`);
  const result = await database.raw(`select * from trips order by id desc limit 1`);
  response.status(200);
  response.json(result[0]);
});
app.get('/api/users/:userID', async (request, response) => {
  const userID = Number (request.params.userID);
  const password = await database.raw(`select password from users where id = ${userID}`);
  response.status(200);
  response.json(password[0].password);
});

app.get('/api/:userID/trips', async (request, response) => {
  const userID = Number (request.params.userID);
  const result = await database.raw(`select * from trips where user_id = ${userID}`);
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
  response.json(result[0]); 
});

app.put('/api/users/:userID', async (request, response) => {
  const userID = Number(request.params.userID);
  const user_data = request.body;
  if(user_data.length!=0){
    if(user_data.email && !user_data.password) {
      await database.raw(`update users set email ='${user_data.email}' where id = ${userID} `);
    }
    else if (user_data.password && !user_data.email) {
      await database.raw(`update users set password ='${user_data.password}' where id = ${userID} `);
    }
    else if(!user_data.email && !user_data.password){
      throw new Error("Something is wrong. Neither email nor password exist!")
    }
    else{
    await database.raw(`update users set email ='${user_data.email}', password ='${user_data.password}' where id = ${userID} `);
    }
  const result = await database.raw(`select * from users where id = ${userID}`);
  response.status(200);
  response.json(result[0]);
  }
  else {
    response.status(404)
    response.json(error.message)
  }

});

app.delete('/api/user/:id', async (request,response)=>{
  const id = request.params.id;
  await database.raw(`delete from users where id=${id}`)
  response.status(200).send("ok")
})

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