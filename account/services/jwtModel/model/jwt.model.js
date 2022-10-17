const mongoose = require('mongoose');
const _ = require('lodash');

const Schema = mongoose.Schema({
	jwtId: {
		type: String,
		require: true,
		unique: true,
	},
	userId: {
		type: Number,
		require: true,
	},
	expiredAt: {
		type: Number,
		require: true,
		default: null,
	},
}, {
	collection: 'jwt',
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
