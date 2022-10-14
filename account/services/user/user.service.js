const _ = require('lodash');
const mongoose = require('mongoose')
const Mail = require('moleculer-mail')

module.exports = {
	name: 'User',

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
		Default: {
			registry: {
				auth: {
					name: "Default",
					jwtKey: process.env.USER_JWT_SECRETKEY
				}
			},
			handler: require("./actions/default.action")
		},

		register: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/User/Register',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
					email: 'string',
					phone: 'string',
					username: 'string',
					password: 'string',
					fullname: 'string',
					gender: 'string',
					avatar: 'string',
				},
			},
			handler: require('./actions/register.rest.action'),
		},

		signin: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/User/Signin',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
					username: 'string',
					password: 'string',
				},
			},
			handler: require('./actions/signin.rest.action'),
		},

		forgotPassword: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/User/ForgotPassword',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
					username: 'string',
					email: 'string',
				},
			},
			handler: require('./actions/forgotPassword.action'),
		},

		resetPassword: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/User/ResetPassword',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					newPassword: 'string',
					reNewPassword: 'string',
				},
			},
			handler: require('./actions/resetPassword.action'),
		}
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
