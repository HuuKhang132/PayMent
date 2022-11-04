const _ = require('lodash');
const mongoose = require('mongoose')
const path = require('path');
const Cron = require("moleculer-cron");
const Queue = require('moleculer-rabbitmq')
const i18n = require('moleculer-i18n-js')

const queueMixin = Queue({
	connection: process.env.RABBITMQ_URI,
	asyncActions: true,
  });

module.exports = {
	name: 'Order',

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

		updateOrder: {
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
					orderId: 'number',
                    paymentStatus: 'string',
				},
			},
			handler: require('./actions/updateOrder.action'),
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
