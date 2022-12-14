const _ = require('lodash');
const mongoose = require('mongoose')
const Mail = require('moleculer-mail')
const i18n = require('moleculer-i18n-js')
const path = require('path');

module.exports = {
	name: 'User',

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
		default: {
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
				fullPath: '/v1/User/Register',
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
				fullPath: '/v1/User/Signin',
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
				fullPath: '/v1/User/Signout',
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
				fullPath: '/v1/User/Update',
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
			queue: {
				amqp: {
					fetch: 1
				},
				retry: {
					max_retry: 3,
					delay: (retry_count) => {	
						return retry_count * 5000;
				  	},
				},
			},
			handler: require('./actions/updateUserInfo.action'),
		},

		forgotPassword: {
			rest: {
				method: 'POST',
				fullPath: '/v1/User/ForgotPassword',
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
				fullPath: '/v1/User/ResetPassword',
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
		},

		getUserInfo: {
			rest: {
				method: 'GET',
				fullPath: '/v1/User/GetUserInfo/:id',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			handler: require('./actions/getUserInfo.rest.action'),
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
