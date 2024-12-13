const express = require("express");
//const fs = require("node:fs");
const { MongoDBClient } = require("./database/mongo_client.js");
const { register_FCMUser } = require("./database/FCMUser.js");
const FCMMessaging = require("./messaging/FCMMessaging.js");

const port = process.env.APPSETTING_WEBSITE_PORT || 3000;
const MONGO_CONN_STR = process.env.APPSETTING_MONGODB_CREDS;
const FCM_ACCOUNT_KEY = JSON.parse(process.env.APPSETTING_FCM_SERVICE_ACCOUNT_KEY);

const app = express();
app.use(express.json());


const fcm_messaging = FCMMessaging(FCM_ACCOUNT_KEY);


//console.log("Env vars:", process.env);

app.get('/', (req, res) => {
  res.json({ "message": "Hello, Fell World!" });
});

app.post('/api/register_token', async (req, res) => {

	const bodyData = req.body;
	const userid = bodyData.userid;
	const name = bodyData.name;
	const registration_token = bodyData.registration_token;
	const client_ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

	//console.log(MONGO_CONN_STR);
	const mongoClientObj = new MongoDBClient(MONGO_CONN_STR);
	let registration_result;
	await mongoClientObj.client_run(async (DBClient) => {
		registration_result = await register_FCMUser(DBClient, {
			"userid": userid,
			"name": name,
			"registration_token": registration_token,
			"client_ip": client_ip,
			"registration_time": new Date(Date.now())
		});
	}).catch(err => {
		console.error(err);
		registration_result = { valid_registration: false, message: "Registration failed!" };
		//const current_date = new Date(Date.now());
		//fs.writeFileSync(`error_logs/${current_date.toISOString()}.txt`, err.toString());
	});

	res.json(registration_result);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
