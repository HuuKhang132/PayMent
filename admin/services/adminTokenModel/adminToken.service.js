const DbService = require('moleculer-db');
const MongooseAdapter = require('moleculer-db-adapter-mongoose');
const MongooseAction = require('moleculer-db-adapter-mongoose-action');
const AdminTokenModel = require('./model/adminToken.model')

module.exports = {
	name: 'AdminTokenModel',

	version: 1,

	mixins: [DbService],

	adapter: new MongooseAdapter(process.env.MONGO_URI_FE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		keepAlive: true,
	}),

	model: AdminTokenModel,

	/**
	 * Settings
	 */
	settings: {
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: MongooseAction(),

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() { },

	/**
	 * Service stopped lifecycle event handler
	 */

	// async stopped() {},

	async afterConnected() {
		this.logger.info('Connected successfully...');
	},
};
