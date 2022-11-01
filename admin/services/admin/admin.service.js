const _ = require('lodash');
const mongoose = require('mongoose')
const i18n = require('moleculer-i18n-js')
const path = require('path');

module.exports = {
	name: 'Admin',

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
		AdminAuth: {
			registry: {
				auth: {
					name: "AdminAuth",
					jwtKey: process.env.USER_JWT_SECRETKEY
				}
			},
			handler: require("./actions/adminAuth.action")
		},

		register: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Admin/Register',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
					username: 'string',
					password: { type: "string", min: 6, max: 20 },
				},
			},
			handler: require('./actions/register.rest.action'),
		},

		signin: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Admin/Signin',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
					username: 'string',
					password: 'string',
					//deviceId: 'string'
				},
			},
			handler: require('./actions/signin.rest.action'),
		},

		signout: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Admin/Signout',
				auth: {
					strategies: ['AdminAuth'],
					mode: 'required'
				},
			},
			params: {

			},
			handler: require('./actions/signout.action'),
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
