const _ = require('lodash');
const mongoose = require('mongoose')
const Cron = require("moleculer-cron");

module.exports = {
	name: 'Jwt',

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
		checkDeactive: {
			handler: require('./actions/checkDeactive.action'),
		},

	},

	crons: [
        {
            name: "CheckDeactive",
            cronTime: '30 * * * *',
            async onTick() {
				try {
					await this.call('v1.Jwt.checkDeactive')
				} catch (err) {
					console.log(err);
				}
            },
        },
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
