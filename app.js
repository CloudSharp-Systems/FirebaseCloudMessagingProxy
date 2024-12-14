const express = require("express");
//const fs = require("node:fs");
const { MongoDBClient } = require("./database/mongo_client.js");
const { register_FCMUser } = require("./database/FCMUser.js");
const FCMMessaging = require("./messaging/FCMMessaging.js");
const { register_FCMNotification, get_FCMNotifications_by_user } = require("./database/FCMNotification.js");
const { send_notification } = require("./messaging/notification.js");


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
	const registration_result = await mongoClientObj.client_run(async (DBClient) => {
		return await register_FCMUser(DBClient, {
			"userid": userid,
			"name": name,
			"registration_token": registration_token,
			"client_ip": client_ip,
			"registration_time": new Date(Date.now())
		});
	}).catch(err => {
		console.error(err);
		return { valid_registration: false, message: "Registration failed!" };
		//const current_date = new Date(Date.now());
		//fs.writeFileSync(`error_logs/${current_date.toISOString()}.txt`, err.toString());
	});

	res.json(registration_result);
});


app.get('/api/get_recent_notifications_by_user', async (req, res) => {

	const query_user = {
		userid: req.query.userid,
		registration_token: req.query.registrationtoken
	};

	const mongoClientObj = new MongoDBClient(MONGO_CONN_STR);
	const query_result = await mongoClientObj.client_run(async (DBClient) => {
		return notifications = (
			await get_FCMNotifications_by_user(DBClient, query_user)
		).map(notification => {
			delete notification["from_registration_token"];
			delete notification["to_registration_token"];
			notification["notification_number"] = notification._id;
			return notification;
		});
	}).catch(err => {
		console.error(err);
		//throw new Error("Recent notifications by user fetching failed!");
		res.status(500).send("Recent notifications by user fetching failed!");
	});

	res.json(query_result);
});

app.post('/api/send_notification', async (req, res) => {
	const bodyData = req.body;

	const notification_obj = {
		"from_token": bodyData.from_registration_token,
		"to_userid": bodyData.to_userid,
		"title": bodyData.title || null,
		"body": bodyData.body,
		"composed_timestamp": bodyData.composed_timestamp
	};

	//console.log(MONGO_CONN_STR);
	const mongoClientObj = new MongoDBClient(MONGO_CONN_STR);
	const mongo_send_result = await mongoClientObj.client_run(async (DBClient) => {
		return await register_FCMNotification(DBClient, notification_obj);
	}).catch(err => {
		console.error(err);
		return { valid_notification: false, message: "FCM notification DB recording failed!" };
		//const current_date = new Date(Date.now());
		//fs.writeFileSync(`error_logs/${current_date.toISOString()}.txt`, err.toString());
	});
	if (!mongo_send_result.valid_notification) {
		res.json(mongo_send_result);
		return;
	}

	const fcm_msg_client = fcm_messaging();
	const fcm_response = await send_notification(fcm_msg_client, mongo_send_result.notification_title, notification_obj.body, { notification_number: mongo_send_result.notification_number.toString() }, mongo_send_result.to_token)
		.then(response => {
			return { notification_sent: true, message: "FCM notification sent.", ...response };
		})
		.catch(err => {
			console.error(err);
			return { notification_sent: false, message: "FCM notification sending failed!" };
		});

	res.json(fcm_response);

});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
