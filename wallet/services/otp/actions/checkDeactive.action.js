const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const otpConstant = require('../../otpModel/constants/otpConstant')

module.exports = async function (ctx) {
	try {
        const date = Date.now()
        await this.broker.call('v1.OtpModel.deleteMany', [
            { status: otpConstant.STATUS.DEACTIVE },
        ])
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Check Expired: ${err.message}`);
	}
};
