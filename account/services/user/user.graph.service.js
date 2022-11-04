const _ = require('lodash');
const i18n = require('moleculer-i18n-js')
const path = require('path');

module.exports = {
	name: 'Account.graph',

	version: 1,

	mixins: [i18n],

    i18n: {
		directory: path.join(__dirname, 'locales'),
		locales: ['vi', 'en'],
		defaultLocale: 'vi'
	},

	/**
	 * Settings
	 */
	settings: {
		graphql: {
			type: require('./graph/type.js'),
			input: require('./graph/input'),
			resolvers: {
				AccountQuery: {
					GetUserInfo: {
						action: 'v1.Account.graph.getUserInfo',
					},
				},
                AccountMutation: {
					Register: {
						action: 'v1.Account.graph.register',
					},
					Signin: {
						action: 'v1.Account.graph.signin',
					},
					Signout: {
						action: 'v1.Account.graph.signout',
					},
					ForgotPassword: {
						action: 'v1.Account.graph.forgotPassword'
					},
					ResetPassword: {
						action: 'v1.Account.graph.resetPassword'
					},
					Update: {
						action: 'v1.Account.graph.update'
					},
				},
			},
		},
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
		 * Actions
		 */
	actions: {
		register: {
			params: {
				input: {
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
			handler: require('./graph.actions/register.graph.action'),
		},
		signin: {
			params: {
				input: {
					$$type: 'object',
					username: 'string',
					password: "string",
				},
			},
			handler: require('./graph.actions/signin.graph.action'),
		},
		signout: {
			params: {
			},
			handler: require('./graph.actions/signout.graph.action'),
		},
		update: {
			params: {
				input: {
					$$type: 'object',
					email: 'email',
					phone: 'string',
					fullname: 'string',
					gender: 'string',
					avatar: 'string',
				},
			},
			handler: require('./graph.actions/updateUserInfo.graph.action'),
		},
		forgotPassword: {
			params: {
				input: {
					$$type: 'object',
					username: 'string',
					email: 'email',
				},
			},
			handler: require('./graph.actions/forgotPassword.graph.action'),
		},
		resetPassword: {
			params: {
				input: {
					$$type: 'object',
					newPassword: { type: "string", min: 6, max: 20 },
					reNewPassword: { type: "string", min: 6, max: 20 },
				},
			},
			handler: require('./graph.actions/resetPassword.graph.action'),
		},
		getUserInfo: {
			params: {
				input: {
					$$type: 'object',
					id: 'number',
				},
			},
			handler: require('./graph.actions/getUserInfo.graph.action'),
		},
		AccountOps: {
			graphql: {
				mutation: 'Account: AccountMutation',
				query: 'Account: AccountQuery',
			},
			handler(ctx) {
				return true;
			},
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
