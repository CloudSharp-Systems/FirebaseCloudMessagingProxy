const express = require("express");
//const fs = require("node:fs");
const { MongoDBClient } = require("./database/mongo_client.js");
const { register_FCMUser } = require("./database/FCMUser.js");

const port = process.env.WEBSITES_PORT || 3000;
const MONGO_CONN_STR = process.env.MONGODB_CREDS;

const app = express();
app.use(express.json())

console.log("Env vars:", process.env);

app.get('/', (req, res) => {
  res.send('Hello, Fell World!');
});

app.post('/api/register_token', async (req, res) => {

	const bodyData = req.body;
	const userid = bodyData.userid;
	const name = bodyData.name;
	const registration_token = bodyData.registration_token;
	const client_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

	//console.log(MONGO_CONN_STR);
	const mongoClientObj = new MongoDBClient(MONGO_CONN_STR);
	await mongoClientObj.client_run(async (DBClient) => {
		await register_FCMUser(DBClient, {
			"userid": userid,
			"name": name,
			"registration_token": registration_token,
			"client_ip": client_ip,
			"registration_time": new Date(Date.now())
		});
	}).catch(err => {
		console.error(err);
		//const current_date = new Date(Date.now());
		//fs.writeFileSync(`error_logs/${current_date.toISOString()}.txt`, err.toString());
	});

	res.json({ "valid": true });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
