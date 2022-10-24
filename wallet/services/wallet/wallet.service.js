const _ = require('lodash');
const mongoose = require('mongoose')
const Queue = require('moleculer-rabbitmq')

const queueMixin = Queue({
	connection: process.env.RABBITMQ_URI,
	asyncActions: true,
  });

module.exports = {
	name: 'Wallet',

	mixins: [queueMixin],

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
				fullPath: '/v1/Wallet/GetUserInfo/:userId',
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
				fullPath: '/v1/Wallet/GetWalletBalance',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			handler: require('./actions/getWalletBalance.action'),
		},

		getWallet: {  //gọi từ các node khác
			params:{
				userId: 'number'
			},
			handler: require('./actions/getWallet.action'),
		},

		changeWalletBalance: {
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
			params: {
				body: {
					$$type: 'object',
					walletId: 'number',
					amount: 'number',
					type: 'string',
					transactionId: 'number'
				},
			},
			timeout: 30*1000,
			handler: require('./actions/changeBalance.action'),
		}, 

		transferApi: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Wallet/Transfer',
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
			timeout: 90*1000,
			handler: require('./actions/transferApi.action'),
		},

		topupApi: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Wallet/Topup',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					amount: 'number',
					supplier: 'string',
				},
			},
			timeout: 90*1000,
			handler: require('./actions/topupApi.action'),
		}, 

		withdraw: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Wallet/Withdraw',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					amount: 'number',
					supplier: 'string'
				},
			},
			timeout: 90*1000,
			handler: require('./actions/withdraw.action'),
		}, 

		walletToBankApi: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Wallet/WalletToBank',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					amount: 'number',
					supplier: 'string',
				},
			},
			timeout: 90*1000,
			handler: require('./actions/walletToBankApi.action'),
		}, 

		bankToWallet: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Wallet/BankToWallet',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					amount: 'number',
					supplier: 'string',
					destUserId: 'number',
				},
			},
			timeout: 90*1000,
			handler: require('./actions/bankToWallet.action'),
		}, 

		bankToBank: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Wallet/BankToBank',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					amount: 'number',
					supplier: 'string',
					destSupplier: 'string',
				},
			},
			timeout: 90*1000,
			handler: require('./actions/bankToBank.action'),
		},

		topup: {
			params: {
				body: {
					$$type: 'object',
					userId: 'number',
					amount: 'number',
					supplier: 'string',
				},
			},
			timeout: 60*1000,
			handler: require('./actions/topup.action'),
		}, 

		transfer: {
			params: {
				body: {
					$$type: 'object',
					userId: 'number',
					destUserId: 'number',
					amount: 'number',
					isAuth: 'string|optional'
				},
			},
			timeout: 60*1000,
			handler: require('./actions/transfer.action'),
		},

		walletToBank: {
			params: {
				body: {
					$$type: 'object',
					userId: 'number',
					amount: 'number',
					supplier: 'string',
					isAuth: 'string|optional'
				},
			},
			timeout: 60*1000,
			handler: require('./actions/walletToBank.action'),
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
