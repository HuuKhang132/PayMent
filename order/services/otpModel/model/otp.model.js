const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');
const _ = require('lodash');
const otpConstant = require('../constants/otpConstant')
autoIncrement.initialize(mongoose);

const Schema = mongoose.Schema({
    userId: {
        type: Number,
        require: true,
        default: null,
    },
    otp: {
        type: Number,
        require: true,
        default: null,
    },
    transactionId: {
        type: Number,
        require: true,
        default: null,
    },
    status: {
        type: String,
        require: true,
        enum: _.values(otpConstant.STATUS),
		default: otpConstant.STATUS.ACTIVE,
    }
}, {
	collection: 'otp',
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
