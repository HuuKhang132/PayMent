const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');

module.exports = async function (ctx) {
	try {
        const date = Date.now()
        const expiredOrder = await this.broker.call('v1.OrderModel.findMany', [
            { createdAt: { $lt: new Date(date-60*1000) }, paymentStatus: orderConstant.PAYMENTSTATUS.UNPAID },
            null,
            { limit: 20 }
        ], { timeout: 30*1000 })
        const listExpiredOrderId = expiredOrder.map(order => {
            return order.id
        })
        return listExpiredOrderId
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Check Expired: ${err.message}`);
	}
};
