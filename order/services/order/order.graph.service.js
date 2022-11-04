const _ = require('lodash');
const i18n = require('moleculer-i18n-js')
const path = require('path');

module.exports = {
	name: 'Order.graph',

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
				OrderQuery: {
					GetAllOrder: {
						action: 'v1.Order.graph.getAllOrder',
					},
                    GetOrder: {
						action: 'v1.Order.graph.getOrder',
					},
				},
                OrderMutation: {
					CreateOrder: {
						action: 'v1.Order.graph.create',
					},
					PayOrder: {
						action: 'v1.Order.graph.pay'
					},
					Napas: {
						action: 'v1.Order.graph.napasSucessful'
					}
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
		getAllOrder: {
			params: {
				input: {
					$$type: 'object',
					page: 'number',
					limit: 'number',
				},
			},
			handler: require('./graph.actions/getAllOrder.graph.action'),
		},
		getOrder: {
			params: {
				input: {
					$$type: 'object',
					id: 'number',
				},
			},
			handler: require('./graph.actions/getOrder.graph.action'),
		},
		create: {
			params: {
				input: {
					$$type: 'object',
					total: 'number',
                    description: 'string',
                    note: 'string',
                    paymentMethod: 'string',
                    providerId: 'number'
				},
			},
			handler: require('./graph.actions/create.graph.action'),
		},
		pay: {
			params: {
				input: {
					$$type: 'object',
					orderId: 'number',
				},
			},
			handler: require('./graph.actions/pay.graph.action'),
		},
		napasSucessful: {
			params: {
				input: {
					$$type: 'object',
					orderId: 'number',
					transactionId: 'number',
					supplierTransactionId: 'string',
					status: 'string'
				},
			},
			handler: require('./graph.actions/napasSucessful.graph.action'),
		},
		OrderOps: {
			graphql: {
				mutation: 'Order: OrderMutation',
				query: 'Order: OrderQuery',
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
