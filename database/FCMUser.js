const { mongo_ping_db, mongo_find_docs, mongo_merge_docs, mongo_delete_docs, mongo_insert_doc } = require("./mongo_client.js");



const CLOUDSHARP_USER_DB = "CloudSharpUserDocDB";

// { "userid": "grandma00000019299394", "registration_token": { "$ne": "3892fu3hE:afoi..." } }
const register_FCMUser = async (DBClient, user_obj) => {
	const filter = { "userid": user_obj.userid };
	//const move_filter = { ...primary_filter, "registration_token": { "$ne": user_obj.registration_token } };

	const find_result = await mongo_find_docs(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", filter);
	if (0 < find_result.length && find_result[0].registration_token === user_obj.registration_token)
		return { valid_registration: true, message: "Existing user found." };

	const merge_result = await mongo_merge_docs(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", "CL_FCM_USER_LOG", filter);
	const delete_result = await mongo_delete_docs(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", filter);
	await mongo_insert_doc(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", user_obj);
	return { valid_registration: true, message: (0 < delete_result.deletedCount)? "User re-registered." : "User registered." };
};

exports.register_FCMUser = register_FCMUser;
