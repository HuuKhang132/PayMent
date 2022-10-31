const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
	walletId: {
		type: Number,
		require: true,
	},
    transactionId: {
		type: Number,
        require: true,
	},
	balanceBefore: {
		type: Number,
		require: true,
		default: 0,
	},
    balanceAfter: {
		type: Number,
		require: true,
		default: 0,
	},
}, {
	collection: 'wallet_history',
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
