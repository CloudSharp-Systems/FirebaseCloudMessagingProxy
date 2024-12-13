const admin = require('firebase-admin');
//const serviceAccount = require('../fcmServiceAccountKey.json');


const FCMMessaging = (service_account_key_obj) => {
	admin.initializeApp({credential: admin.credential.cert(service_account_key_obj)});
	//const messaging = admin.messaging();
	//return messaging;
	return admin.messaging;
};

module.exports = FCMMessaging;
