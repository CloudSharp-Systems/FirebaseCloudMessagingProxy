const express = require("express");
const fs = require("node:fs");
const { MongoDBClient } = require("./database/mongo_client.js");
const { register_FCMUser } = require("./database/FCMUser.js");


const app = express();
const port = process.env.PORT || 3000;
const MONGO_CONN_STR = process.env.MONGODB_CREDS;

app.get('/', (req, res) => {
  res.send('Hello, Fell World!');
});

app.post('/api/register_token', async (req, res) => {

	//console.log(MONGO_CONN_STR);
	const mongoClientObj = new MongoDBClient(MONGO_CONN_STR);
	mongoClientObj.client_run(async (DBClient) => {
		register_FCMUser(DBClient, { "userid": "grandma00000029942910", "registration_token": "EUIFAOE:AEaeffih23ro" });
	}).catch(err => {
		console.error(err);
		const current_date = new Date(Date.now());
		fs.writeFileSync(`error_logs/${current_date.toISOString()}.txt`, err.toString());
	});

	res.json({ "valid": true });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
