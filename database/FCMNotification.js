const { CLOUDSHARP_USER_DB, mongo_find_docs, mongo_insert_doc } = require("./mongo_client.js");



const register_FCMNotification = async (DBClient, notification_obj) => {
	const sender_filter = { "registration_token": notification_obj.from_token };
	const receiver_filter = { "userid": notification_obj.to_userid };
	const last_note_options = { sort: { _id: -1 }, limit: 1 };
	//const move_filter = { ...primary_filter, "registration_token": { "$ne": user_obj.registration_token } };

	const find_sender_result = await mongo_find_docs(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", sender_filter);
	if (find_sender_result.length === 0) throw new Error(`Notification sender not found!`);
	const find_receiver_result = await mongo_find_docs(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", receiver_filter);
	if (find_receiver_result.length === 0) throw new Error(`Notification receiver not found!`);
	const find_last_message_result = await mongo_find_docs(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_NOTIFICATION", {}, last_note_options);

	const new_id = (0 < find_last_message_result.length)? find_last_message_result[0]._id + 1 : 1;

	const notification_record = {
		_id: new_id,
		from_registration_token: find_sender_result[0].registration_token,
		to_registration_token: find_receiver_result[0].registration_token,
		from_userid: find_sender_result[0].userid,
		to_userid: find_receiver_result[0].userid,
		title: notification_obj.title || find_sender_result[0].name,
		body: notification_obj.body,
		composed_timestamp: notification_obj.composed_timestamp,
		edit_time: new Date(Date.now())
	};

	await mongo_insert_doc(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_NOTIFICATION", notification_record);
	return {
		valid_notification: true,
		to_token: notification_record.to_registration_token,
		notification_title: notification_record.title,
		notification_number: notification_record._id,
		message: "FCM notification recorded."
	};
};

exports.register_FCMNotification = register_FCMNotification;
