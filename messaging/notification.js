

const send_notification = async (messaging_client, message_title, message_body, registration_token) => {
	const message_obj = {
		notification: {
			title: message_title,
			body: message_body
		},
		token: registration_token
	};

	let response = await messaging_client.send(message);
	return response;
};
