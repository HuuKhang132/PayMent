const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');

module.exports = async function (ctx) {
	try {
        const date = Date.now()
        const expiredOrder = await this.broker.call('v1.OrderModel.updateMany', [
            { createdAt: { $lt: new Date(date-60*60*1000) }, paymentStatus: orderConstant.PAYMENTSTATUS.UNPAID },
            { $set: { paymentStatus: orderConstant.PAYMENTSTATUS.CANCEL } }
        ], { timeout: 20*1000 })
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Check Expired: ${err.message}`);
	}
};
