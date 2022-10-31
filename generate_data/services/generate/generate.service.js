const _ = require('lodash');
const mongoose = require('mongoose')
const i18n = require('moleculer-i18n-js')
const path = require('path');

module.exports = {
	name: 'Generate',

	mixins: [i18n],

	version: 1,

	i18n: {
		directory: path.join(__dirname, 'locales'),
		locales: ['vi', 'en'],
		defaultLocale: 'vi'
	},

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
		generateAccount: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Generate/GenerateAccount',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
                    quantity: 'number'
				},
			},
			timeout: 6000*1000,
			handler: require('./actions/generateAccount.action'),
		},

		generateTransaction: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Generate/GenerateTransaction',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
                    quantity: 'number'
				},
			},
			timeout: 6000*1000,
			handler: require('./actions/generateTransaction.action'),
		},
	},

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
