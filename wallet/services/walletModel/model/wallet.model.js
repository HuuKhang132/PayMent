const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
	userId: {
		type: Number,
		require: true,
		unique: true,
	},
    fullname: {
		type: String,
        require: true,
		default: "",
	},
	balance: {
		type: Number,
		require: true,
		default: 0,
	},
}, {
	collection: 'wallet',
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
