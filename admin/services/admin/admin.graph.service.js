const _ = require('lodash');
const i18n = require('moleculer-i18n-js')
const path = require('path');

module.exports = {
	name: 'Admin.graph',

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
                AdminMutation: {
					Register: {
						action: 'v1.Admin.graph.register',
					},
					Signin: {
						action: 'v1.Admin.graph.signin',
					},
					Signout: {
						action: 'v1.Admin.graph.signout',
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
		AdminOps: {
			graphql: {
				mutation: 'Admin: AdminMutation',
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
