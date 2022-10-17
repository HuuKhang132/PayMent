const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');
const transactionConstant = require('../constants/transactionConstant')
autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
    walletId: {
        type: Number,
        require: true,
        default: null,
    },
    destWalletId: {
        type: Number,
        require: true,
        default: null,
    },
	status: {
		type: String,
		require: true,
		enum: _.values(transactionConstant.STATUS),
		default: transactionConstant.STATUS.PENDING,
	},
	orderId: {
		type: Number,
        require: true,
        default: null,
	},
	total: {
		type: Number,
        require: true,
        default: null,
	},
	type: {
		type: String,
		require: true,
		enum: _.values(transactionConstant.TYPE),
		default: "",
	}
}, {
	collection: 'transaction',
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
