const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant');

module.exports = async function (ctx) {
	try {
        const date = Date.now()
        const expiredTransaction = await this.broker.call('v1.OrderModel.updateMany', [
            { createdAt: { $lt: new Date(date-5*60*1000) }, status: transactionConstant.STATUS.PENDING },
            { $set: { status: transactionConstant.STATUS.FAILED } }
        ], { timeout: 20*1000 })
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Check Expired: ${err.message}`);
	}
};
