const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');
const accountConstant = require("../constants/adminConstant")
require('mongoose-type-email');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
	username: {
		type: String,
		require: true,
        unique: true
	},
	password: {
		type: String,
		require: true,
	},
}, {
	collection: 'admin',
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
