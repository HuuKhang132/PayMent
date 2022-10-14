const _ = require('lodash');
const mongoose = require('mongoose')

module.exports = {
	name: 'Wallet',

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
			rest: {
				method: 'POST',
				fullPath: '/v1/External/Wallet/Create',
				auth: false,
			},
			params: {
				walletCreateInfo: {
					$$type: 'object',
					userId: 'number',
					fullname: 'string',
				},
			},
			handler: require('./actions/create.rest.action'),
		},

		getUserInfo: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Internal/Wallet/GetUserInfo',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					id: 'number',
				},
			},
			handler: require('./actions/getUserInfo.rest.action'),
		},

		getWalletBalance: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Internal/Wallet/GetWalletBalance',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
					userId: 'number',
				},
			},
			handler: require('./actions/getWalletBalance.action'),
		},

		changeWalletBalance: {
			// rest: {
			// 	method: 'POST',
			// 	fullPath: '/v1/Internal/Wallet/ChangeWalletBalance',
			// 	auth: {
			// 		strategies: ['Default'],
			// 		mode: 'required', // 'required', 'optional', 'try'
			// 	},
			// },
			params: {
				body: {
					$$type: 'object',
					walletId: 'number',
					amount: 'number',
					type: 'string',
				},
			},
			handler: require('./actions/changeBalance.action'),
		}, 

		transfer: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Internal/Wallet/Transfer',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					destUserId: 'number',
					amount: 'number',
				},
			},
			handler: require('./actions/transfer.action'),
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
