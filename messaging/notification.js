

const send_notification = async (fcm_messaging, message_title, message_body, registration_token) => {
	const message_obj = {
		notification: {
			title: message_title,
			body: message_body
		},
		token: registration_token
	};

	let response = await fcm_messaging().send(message);
	return response;
};
