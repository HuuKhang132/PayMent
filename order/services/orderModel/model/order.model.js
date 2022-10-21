const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');
const orderConstant = require('../constants/orderConstant')
autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
    userId: {
        type: Number,
        require: true,
        default: null,
    },
    total: {
        type: Number,
        require: true,
        default: 0,
    },
	description: {
		type: String,
		require: true,
		default: "",
	},
	note: {
		type: String,
		require: true,
        default: "",
	},
	paymentStatus: {
		type: String,
		require: true,
        enum: _.values(orderConstant.PAYMENTSTATUS),
        default: orderConstant.PAYMENTSTATUS.UNPAID,
	},
	paymentMethod: {
		type: String,
		require: true,
        enum: _.values(orderConstant.PAYMENTMETHOD),
		default: orderConstant.PAYMENTMETHOD.WALLET,
	},
	providerId: {
        type: Number,
        require: true,
        default: null,
    },
}, {
	collection: 'order',
	versionKey: false,
	timestamps: true,
});

/*
| ==========================================================
| Plugins
| ==========================================================
*/

Schema.plugin(autoIncrement.plugin, {
	model: `${Schema.options.collection}-id`,
	field: 'id',
	startAt: 1,
	incrementBy: 1,
});

/*
| ==========================================================
| Methods
| ==========================================================
*/

/*
| ==========================================================
| HOOKS
| ==========================================================
*/

module.exports = mongoose.model(Schema.options.collection, Schema);
