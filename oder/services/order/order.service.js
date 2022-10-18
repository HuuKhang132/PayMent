const _ = require('lodash');
const mongoose = require('mongoose')
const Cron = require("moleculer-cron");

module.exports = {
	name: 'Order',

	mixins: [Cron],

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
				fullPath: '/v1/External/Order/Create',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
					total: 'number',
                    description: 'string',
                    note: 'string',
                    paymentMethod: 'string',
                    providerId: 'number'
				},
			},
			handler: require('./actions/create.action'),
		},

        pay: {
			rest: {
				method: 'POST',
				fullPath: '/v1/External/Order/Pay',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
                    orderId: 'number',
				},
			},
			handler: require('./actions/pay.action'),
		},

		getAllOrder: {
			rest: {
				method: 'GET',
				fullPath: '/v1/External/Order/GetAllOrder',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			handler: require('./actions/getAllOrder.action'),
		},

		getOrder: {
			rest: {
				method: 'GET',
				fullPath: '/v1/External/Order/GetOrder/:id',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			handler: require('./actions/getOrder.action'),
		},

		napasSucessful: {
			rest: {
				method: 'GET',
				fullPath: '/v1/External/Order/Napas',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				body: {
					$$type: 'object',
                    orderId: 'number',
					status: 'string'
				},
			},
			handler: require('./actions/napasSucessful.action'),
		},

		checkExpiredOrder: {
			handler: require('./actions/checkExpiredOrder.action'),
		},

	},

	crons: [
        {
            name: "CheckExpiredOrder",
            cronTime: '*/1 * * * *',
            async onTick() {
				try {
					await this.call('v1.Order.checkExpiredOrder')
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
