const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../constants/transactionConstant')
const otpConstant = require('../../otpModel/constants/otpConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials
        
        const transaction = await this.broker.call('v1.Transaction.walletToBank', {
            body: {
                userId: user.id,
                transactionId: payload.transactionId,
				otp: payload.otp,
            }
        })
        return transaction
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] WithDraw: ${err.message}`);
	}
};
