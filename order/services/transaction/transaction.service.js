const _ = require('lodash');
const path = require('path');
const mongoose = require('mongoose')
const Cron = require("moleculer-cron");
const Queue = require('moleculer-rabbitmq');
const i18n = require('moleculer-i18n-js')

const queueMixin = Queue({
	connection: process.env.RABBITMQ_URI,
	asyncActions: true,
});

  

module.exports = {
	name: 'Transaction',
	
	mixins: [Cron, queueMixin, i18n],

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

		verifyTransaction: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Transaction/VerifyTransaction',
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
			handler: require('./actions/verifyTransaction.action'),
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

		ipnWithdraw: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Transaction/IpnWithdraw',
				auth: false,
			},
			params: {
				body: {
					$$type: 'object',
					transactionId: 'number',
					status: 'string',
					supplierTransactionId: 'string'
				},
			},
			timeout: 90*1000,
			handler: require('./actions/ipnWithdraw.action'),
		},

		getStatisticTransactionByDate: {
			rest: {
				method: 'GET',
				fullPath: '/v1/Transaction/GetStatisticTransactionByDate',
				auth: {
					strategies: ['AdminAuth'],
					mode: 'required'
				},
			},
			params: {
				query: {
					$$type: 'object',
					from: 'string',
					to: 'string',
					type: 'string | optional'
				},
			},
			timeout: 90*1000,
			handler: require('./actions/getStatisticTransactionByDate.action'),
		},

		getStatisticTransactionByAccount: {
			rest: {
				method: 'GET',
				fullPath: '/v1/Transaction/GetStatisticTransactionByAccount',
				auth: {
					strategies: ['AdminAuth'],
					mode: 'required'
				},
			},
			params: {
				query: {
					$$type: 'object',
					from: 'string',
					to: 'string',
					accountId: 'string | optional | null'
				},
			},
			timeout: 90*1000,
			handler: require('./actions/getStatisticTransactionByAccount.action')
		},

		exportStatisticTransactionByDate: {
			rest: {
				method: 'GET',
				fullPath: '/v1/Transaction/ExportStatisticTransactionByDate',
				auth: {
					strategies: ['AdminAuth'],
					mode: 'required'
				},
			},
			params: {
				query: {
					$$type: 'object',
					from: 'string',
					to: 'string',
					type: 'string | optional'
				},
			},
			timeout: 90*1000,
			handler: require('./actions/exportStatisticTransactionByDate.action'),
		},

		exportStatisticTransactionByAccount: {
			rest: {
				method: 'GET',
				fullPath: '/v1/Transaction/ExportStatisticTransactionByAccount',
				auth: {
					strategies: ['AdminAuth'],
					mode: 'required'
				},
			},
			params: {
				query: {
					$$type: 'object',
					from: 'string',
					to: 'string',
					accountId: 'string | optional'
				},
			},
			timeout: 90*1000,
			handler: require('./actions/exportStatisticTransactionByAccount.action')
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
					transactionId: 'number',
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
