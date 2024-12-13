

const send_notification = async (messaging_client, message_title, message_body, extra_data, registration_token) => {
	const message_obj = {
		notification: {
			title: message_title,
			body: message_body
		},
		data: extra_data,
		token: registration_token
	};

	let response = await messaging_client.send(message_obj);
	return response;
};

exports.send_notification = send_notification;
