const mongoose = require('mongoose');
const _ = require('lodash');

const Schema = mongoose.Schema({
	jwt: {
		type: String,
		require: true,
		unique: true,
	},
	expiredAt: {
		type: Date,
		require: true,
		default: null,
	},
}, {
	collection: 'jwt_blacklist',
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
