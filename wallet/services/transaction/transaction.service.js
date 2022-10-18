const _ = require('lodash');
const mongoose = require('mongoose')

module.exports = {
	name: 'Transaction',

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

		create: {
			params: {
				body: {
					$$type: 'object',
					userId: "number",
					walletId: 'number',
                    total: 'number',
					type: 'string',
				},
			},
			handler: require('./actions/create.action'),
		},

		transact: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/Transaction/Transact',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					otp: 'number',
                    transactionId: 'number',
				},
			},
			handler: require('./actions/transact.action'),
		},

		withdraw: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/Transaction/Withdraw',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
                    transactionId: 'number',
				},
			},
			handler: require('./actions/withdraw.action'),
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
