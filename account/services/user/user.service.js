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
					email: 'email',
					phone: 'string',
					username: 'string',
					password: { type: "string", min: 6, max: 20 },
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

		signout: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/User/Signout',
				auth: {
					strategies: ['Default'],
					mode: 'required'
				},
			},
			params: {

			},
			handler: require('./actions/signout.action'),
		},

		update: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/User/Update',
				auth: {
					strategies: ['Default'],
					mode: 'required'
				},
			},
			params: {
				body: {
					$$type: 'object',
					email: 'email',
					phone: 'string',
					fullname: 'string',
					gender: 'string',
					avatar: 'string',
				},
			},
			handler: require('./actions/updateUserInfo.action'),
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
					email: 'email',
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
					newPassword: { type: "string", min: 6, max: 20 },
					reNewPassword: { type: "string", min: 6, max: 20 },
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
