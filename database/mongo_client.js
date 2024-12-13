const { MongoClient } = require("mongodb");


class MongoDBClient {

	constructor(connection_string) {
		//const connectionConfig = JSON.parse(fs.readFileSync(connectionConfigFileName).toString());
                this._connection_str = connection_string;
	}

	async client_run(job) {
		const client = new MongoClient(this._connection_str);
		await client.connect();

		const result = await job(client);

		await client.close();
		return result;
	}

}



const mongo_ping_db = async (client, database_name) => {
	await client.db(database_name).command({ ping: 1 });
}

const mongo_insert_doc = async (client, database_name, collection_name, doc) => {
	const database = client.db(database_name);
	const collection = database.collection(collection_name);

	const insert_result = await collection.insertOne(doc);
	//console.log(insert_result);
	return insert_result;
}


// example filter: { "userid": "grandma00000019299394", "registration_token": { "$ne": "3892fu3hE:afoi..." } }
const mongo_find_docs = async (client, database_name, collection_name, filter, options = null) => {
	const database = client.db(database_name);
	const collection = database.collection(collection_name);

	const find_result = ((options)? collection.find(filter, options) : collection.find(filter)).toArray();
	return find_result;
};

const mongo_merge_docs = async (client, database_name, source_collection_name, destination_collection_name, filter) => {
	const database = client.db(database_name);
	const source_collection = database.collection(source_collection_name);

	const aggregation = [
		{ "$match": JSON.parse(JSON.stringify(filter)) },
		{ "$merge": { "into": destination_collection_name } }
	];
	const aggregate_result = await source_collection.aggregate(aggregation).toArray();
	//console.log(aggregate_result);
	return { acknowledged: true, aggregated_array: aggregate_result };
}

const mongo_delete_docs = async (client, database_name, collection_name, filter) => {
	const database = client.db(database_name);
	const collection = database.collection(collection_name);

	const delete_result = await collection.deleteMany(filter);
	//console.log(delete_result);
	return delete_result;
}



exports.MongoDBClient = MongoDBClient;
exports.mongo_ping_db = mongo_ping_db;
exports.mongo_insert_doc = mongo_insert_doc;
exports.mongo_merge_docs = mongo_merge_docs;
exports.mongo_delete_docs = mongo_delete_docs;
exports.mongo_find_docs = mongo_find_docs;
exports.CLOUDSHARP_USER_DB = "CloudSharpUserDocDB";
