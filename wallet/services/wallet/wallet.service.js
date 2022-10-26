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
