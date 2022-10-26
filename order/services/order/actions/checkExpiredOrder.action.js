const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');

module.exports = async function (ctx) {
    let lock;
	try {
        const payload = ctx.params.body

        lock = await this.broker.cacher.lock(
			`id_${payload.orderId}`,
			60*1000
		)
        console.log(`lock ${payload.orderId}`)

        const expiredOrder = await this.broker.call('v1.OrderModel.findOneAndUpdate', [
            { id: payload.orderId },
            { $set: { paymentStatus: orderConstant.PAYMENTSTATUS.CANCEL } }
        ], { timeout: 20*1000 })

	} catch (err) {
        console.log("err  ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Check Expired: ${err.message}`);
	} finally {
		if (_.isFunction(lock)) {
            lock();
		}
	}
};
