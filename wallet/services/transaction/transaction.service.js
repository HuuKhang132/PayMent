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
					walletId: 'number|optional',
					destWalletId: 'number|optional',
                    total: 'number',
					orderId: 'number|optional',
					type: 'string',
					supplier: 'string|optional',
					supplierTransactionId: 'string|optional',
					isAuth: 'string|optional'
				},
			},
			handler: require('./actions/create.action'),
		},

		transactApi: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Transaction/Transact',
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
			handler: require('./actions/transactApi.action'),
		},

		walletToBankApi: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Transaction/WalletToBank',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
                    transactionId: 'number',
					otp: 'number'
				},
			},
			handler: require('./actions/walletToBankApi.action'),
		},

		topup: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Transaction/Topup',
				auth: false
			},
			params: {
				body: {
					$$type: 'object',
					transactionId: 'number',
					supplierTransactionId: 'string',
					status: 'string'
				},
			},
			handler: require('./actions/topup.action'),
		}, 

		bankApiExample: {
			params: {
	
			},
			handler: require('./actions/bankApiExample.action'),
		}, 

		transact: {
			params: {
				body: {
					$$type: 'object',
					userId: 'number',
					otp: 'number|optional',
                    transactionId: 'number',
					isAuth: 'string|optional'
				},
			},
			handler: require('./actions/transact.action'),
		},

		walletToBank: {
			params: {
				body: {
					$$type: 'object',
					userId: 'number',
                    transactionId: 'number',
					otp: 'number|optional',
					isAuth: 'string|optional'
				},
			},
			handler: require('./actions/walletToBank.action'),
		},

		updateTransaction: {
			params: {
				body: {
					$$type: 'object',
					status: 'string',
                    supplierTransactionId: 'string',
				},
			},
			handler: require('./actions/updateTransaction.action'),
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
