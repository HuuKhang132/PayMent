const _ = require('lodash');
const mongoose = require('mongoose')
const Cron = require("moleculer-cron");
const Queue = require('moleculer-rabbitmq')

const queueMixin = Queue({
	connection: process.env.RABBITMQ_URI,
	asyncActions: true,
  });

module.exports = {
	name: 'Order',

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
				fullPath: '/v1/Order/Create',
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
			timeout: 60*1000,
			handler: require('./actions/create.action'),
		},

        pay: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Order/Pay',
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
				fullPath: '/v1/Order/GetAllOrder',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			params: {
				query: {
					$$type: 'object',
					page: 'string',
					limit: 'string',
				}
			},
			handler: require('./actions/getAllOrder.action'),
		},

		getOrder: {
			rest: {
				method: 'GET',
				fullPath: '/v1/Order/GetOrder/:id',
				auth: {
					strategies: ['Default'],
					mode: 'required', // 'required', 'optional', 'try'
				},
			},
			handler: require('./actions/getOrder.action'),
		},

		napasSucessful: {
			rest: {
				method: 'POST',
				fullPath: '/v1/Order/Napas',
				auth: false,
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
                    orderId: 'number'
				}
			},
			timeout: 20*1000,
			handler: require('./actions/checkExpiredOrder.action'),
		},

		getListExpiredOrderId: {
			handler: require('./actions/getListExpiredOrderId.action'),
		},

	},

	crons: [
        {
            name: "CheckExpiredOrder",
            cronTime: '0 30 */1 * * *',
            async onTick() {
				try {
					const listExpiredOrderId = await this.call('v1.Order.getListExpiredOrderId')
					console.log("listExpiredOrderId  ", listExpiredOrderId)
					listExpiredOrderId.forEach( async(orderId) => {
						await this.call('v1.Order.checkExpiredOrder', {
							body: {
								orderId: orderId
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
