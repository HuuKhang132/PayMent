const _ = require('lodash');
const i18n = require('moleculer-i18n-js')
const path = require('path');

module.exports = {
	name: 'Transaction.graph',

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
			type: require('./graph/type'),
			input: require('./graph/input'),
			resolvers: {
				TransactionQuery: {
					GetStatisticTransactionByDate: {
						action: 'v1.Transaction.graph.getStatisticTransactionByDate',
					},
                    GetStatisticTransactionByAccount: {
						action: 'v1.Transaction.graph.getStatisticTransactionByAccount',
					},
				},
                TransactionMutation: {
					TopUp: {
						action: 'v1.Transaction.graph.topup',
					},
					Transfer: {
						action: 'v1.Transaction.graph.transfer',
					},
					Withdraw: {
						action: 'v1.Transaction.graph.withdraw',
					},
					VerifyTransaction: {
						action: 'v1.Transaction.graph.verifyTransaction'
					},
					IpnWithdraw: {
						action: 'v1.Transaction.graph.ipnWithdraw'
					},
					ExportStatisticTransactionByDate: {
						action: 'v1.Transaction.graph.exportStatisticTransactionByDate',
					},
                    ExportStatisticTransactionByAccount: {
						action: 'v1.Transaction.graph.exportStatisticTransactionByAccount',
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
        getStatisticTransactionByDate: {
            params: {
				input: {
					$$type: 'object',
					from: {
						type: 'string',
					},
                    to: {
						type: 'string',
					},
                    type: {
						type: 'string',
                        optional: true,
					},

				},
			},
			handler: require('./graph.actions/getStatisticTransactionByDate.graph.action'),
		},
        getStatisticTransactionByAccount: {
			params: {
				input: {
					$$type: 'object',
					from: {
						type: 'string',
					},
                    to: {
						type: 'string',
					},
                    accountId: {
						type: 'number',
                        optional: true,
					},

				},
			},
			handler: require('./graph.actions/getStatisticTransactionByAccount.graph.action'),
		},
        topup: {
			params: {
				input: {
					$$type: 'object',
					amount: 'number',
					supplier: 'string',
				},
			},
			handler: require('./graph.actions/topup.graph.action'),
		}, 
		transfer: {
			params: {
				input: {
					$$type: 'object',
					amount: 'number',
					destWalletId: 'number',
				},
			},
			handler: require('./graph.actions/transfer.graph.action'),
		}, 
		withdraw: {
			params: {
				input: {
					$$type: 'object',
					amount: 'number',
					supplier: 'string',
				},
			},
			handler: require('./graph.actions/withdraw.graph.action'),
		},
		verifyTransaction: {
			params: {
				input: {
					$$type: 'object',
					otp: 'number',
					transactionId: 'number',
				},
			},
			handler: require('./graph.actions/verifyTransaction.graph.action'),
		},
		ipnWithdraw: {
			params: {
				input: {
					$$type: 'object',
					transactionId: 'number',
					status: 'string',
					supplierTransactionId: 'string'
				},
			},
			handler: require('./graph.actions/ipnWithdraw.graph.action'),
		},
		exportStatisticTransactionByDate: {
            params: {
				input: {
					$$type: 'object',
					from: {
						type: 'string',
					},
                    to: {
						type: 'string',
					},
                    type: {
						type: 'string',
                        optional: true,
					},

				},
			},
			handler: require('./graph.actions/exportStatisticTransactionByDate.graph.action'),
		},
        exportStatisticTransactionByAccount: {
			params: {
				input: {
					$$type: 'object',
					from: {
						type: 'string',
					},
                    to: {
						type: 'string',
					},
                    accountId: {
						type: 'number',
                        optional: true,
					},

				},
			},
			handler: require('./graph.actions/exportStatisticTransactionByAccount.graph.action'),
		},
		TransactionOps: {
			graphql: {
				mutation: 'Transaction: TransactionMutation',
				query: 'Transaction: TransactionQuery',
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
