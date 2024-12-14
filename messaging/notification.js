

const send_notification = async (messaging_client, message_title, message_body, extra_data, registration_token) => {
	const message_obj = {
		notification: {
			title: message_title,
			body: message_body
		},
		data: extra_data,
		token: registration_token,
		android: {
			notification: {
				defaultSound: true,
				notificationCount: 1,
				sound: "notification_ringtone.mp3",
				channelId: "local_fcm_default_channel"
			},
			ttl: 20000
		},
		apns: {
			payload: {
				aps: { badge: 1, sound: "default" }
			}
		}
	};

	let response = await messaging_client.send(message_obj);
	return response;
};

exports.send_notification = send_notification;
