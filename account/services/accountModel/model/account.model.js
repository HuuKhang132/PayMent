const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');
const accountConstant = require("../constants/accountConstant")
require('mongoose-type-email');

autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
	email: {
		type: mongoose.SchemaTypes.Email,
		require: true,
		unique: true,
	},
	phone: {
		type: String,
		require: true,
        unique: true,
		default: null,
	},
	username: {
		type: String,
		require: true,
        unique: true
	},
	password: {
		type: String,
		require: true,
	},
	fullname: {
		type: String,
		default: null,
	},
	gender: {
			type: String,
			enum: _.values(accountConstant.GENDER),
	},

	avatar: {
		type: String,
		require: true,
	},
}, {
	collection: 'account',
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
