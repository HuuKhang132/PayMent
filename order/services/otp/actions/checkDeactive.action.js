const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const otpConstant = require('../../otpModel/constants/otpConstant')

module.exports = async function (ctx) {
	try {
        const date = Date.now()
        const deletedOtp = await this.broker.call('v1.OtpModel.deleteMany', [
            { 
				$or: [
					{ status: otpConstant.STATUS.DEACTIVE },
					{ createdAt: { $lt: new Date(date - 5*60*1000) } }
				]
			}
        ], { timeout: 20*1000 })
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[OTP] Check Deactive: ${err.message}`);
	}
};
