const { mongo_ping_db, mongo_merge_docs, mongo_delete_docs, mongo_insert_doc } = require("./mongo_client.js");



const CLOUDSHARP_USER_DB = "CloudSharpUserDocDB";

// { "userid": "grandma00000019299394", "registration_token": { "$ne": "3892fu3hE:afoi..." } }
const register_FCMUser = async (DBClient, user_obj) => {
	const filter = { "userid": user_obj.userid, "registration_token": { "$ne": user_obj.registration_token } };
	//await mongo_ping_db(DBClient, CLOUDSHARP_USER_DB);
	const merge_result = await mongo_merge_docs(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", "CL_FCM_USER_LOG", filter);
	//if (!merge_result.acknowledged || merge_result.aggregated_array.length == 0) return;
	const delete_result = await mongo_delete_docs(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", filter);
	if (!delete_result.acknowledged || delete_result.deletedCount == 0) return;
	await mongo_insert_doc(DBClient, CLOUDSHARP_USER_DB, "CL_FCM_USER", user_obj);
};

exports.register_FCMUser = register_FCMUser;
