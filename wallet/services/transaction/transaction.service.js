const _ = require('lodash');
const mongoose = require('mongoose')
const Cron = require("moleculer-cron");
const Queue = require('moleculer-rabbitmq')

const queueMixin = Queue({
	connection: process.env.RABBITMQ_URI,
	asyncActions: true,
  });

module.exports = {
	name: 'Transaction',
	
	mixins: [Cron, queueMixin],

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

		transact: {
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
			handler: require('./actions/transact.action'),
		},

		topup: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Transaction/Topup',
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
			handler: require('./actions/topup.action'),
		}, 

		withdraw: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Transaction/Withdraw',
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

		transfer: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Transaction/Transfer',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					destWalletId: 'number',
					amount: 'number',
				},
			},
			timeout: 90*1000,
			handler: require('./actions/transfer.action'),
		},

		bankApiExample: {
			params: {
	
			},
			handler: require('./actions/bankApiExample.action'),
		}, 

		updateTransaction: {
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
					status: 'string',
                    supplierTransactionId: 'string | optional',
				},
			},
			handler: require('./actions/updateTransaction.action'),
		},

		checkExpiredTransaction: {
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
                    transactionId: 'number'
				}
			},
			timeout: 20*1000,
			handler: require('./actions/checkExpiredTransaction.action'),
		},

		getListExpiredTransactionId: {
			handler: require('./actions/getListExpiredTransactionId.action'),
		},
	},

	crons: [
        {
            name: "CheckExpiredTransaction",
            cronTime: '0 0 */1 * * *',
            async onTick() {
				try {
					const listExpiredTransactionId = await this.call('v1.Transaction.getListExpiredTransactionId')
					console.log("listExpiredTransactionId  ", listExpiredTransactionId)
					listExpiredTransactionId.forEach( async(transactionId) => {
						await this.call('v1.Transaction.checkExpiredTransaction', {
							body: {
								transactionId: transactionId
							}
						})
					});
				} catch (err) {
					console.log(err);
				}
            },
        },
    ],

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
