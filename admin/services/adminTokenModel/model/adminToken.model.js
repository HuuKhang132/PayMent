const mongoose = require('mongoose');
const _ = require('lodash');
const tokenConstant = require('../constants/tokenConstant')

const Schema = mongoose.Schema({
	jwtId: {
		type: String,
		require: true,
		unique: true,
	},
	adminId: {
		type: Number,
		require: true,
	},
	expiredAt: {
		type: Number,
		require: true,
		default: null,
	},
	deviceId: {
		type: String,
		require: true,
		default: null
	},
	state: {
		type: String,
		require: true,
		enum: _.values(tokenConstant.STATE),
		default: tokenConstant.STATE.SIGNEDIN
	},
	logoutTime: {
		type: Date,
		require: true,
		default: null
	}
}, {
	collection: 'admin_token',
	versionKey: false,
	timestamps: true,
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
