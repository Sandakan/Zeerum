const { MongoClient } = require('mongodb');
const { articleData, users, tags } = require('./data/data');
require('dotenv').config();

const data = articleData;
console.log('execution started');
//? DATABASE CONNECTION ////////////////////////////////////
const client = new MongoClient(process.env.DATABASE_CONNECTION_STRING);

// const jsonData = json.parse(data);
// console.log(jsonData);

const addData = async (col, data) => {
	try {
		await client.connect();
		console.log('Connected successfully to the database server');
		const database = client.db(process.env.DATABASE_NAME);
		const collection = database.collection(col);
		//const customData = {};
		collection.insertMany(data, (err, res) => {
			if (err) throw err;
			console.log(res);
		});
		await client.close();
	} catch (err) {
		console.log(err.stack);
	} finally {
		await client.close();
	}
};

addData('articles', data);
