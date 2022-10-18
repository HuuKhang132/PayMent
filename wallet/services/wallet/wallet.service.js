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
				method: 'GET',
				fullPath: '/v1/Internal/Wallet/GetUserInfo/:userId',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			handler: require('./actions/getUserInfo.rest.action'),
		},

		getWalletBalance: {
			rest: {
				method: 'GET',
				fullPath: '/v1/Internal/Wallet/GetWalletBalance/:id',
				auth: false,
			},
			handler: require('./actions/getWalletBalance.action'),
		},

		changeWalletBalance: {
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
		},

		topup: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Internal/Wallet/Topup',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					amount: 'number',
				},
			},
			handler: require('./actions/topup.action'),
		}, 

		withdraw: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Internal/Wallet/Withdraw',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					amount: 'number',
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
