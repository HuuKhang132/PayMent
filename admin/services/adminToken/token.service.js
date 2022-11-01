const _ = require('lodash');
const mongoose = require('mongoose')
const Cron = require("moleculer-cron");

module.exports = {
	name: 'AdminToken',

	mixins: [Cron],

	version: 1,

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
	actions: {
		authorize: {
			handler: require('./actions/authorize.action'),
		},
	},

	crons: [
    ],


	/**
 * Events
 */
	events: {

	},

	/**
* Methods
*/
	methods: {

	},

	/**
* Service created lifecycle event handler
*/
	created() {

	},

	/**
* Service started lifecycle event handler
*/
	async started() {
	},

	/**
* Service stopped lifecycle event handler
*/
	async stopped() {
	},
};
