const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant')

module.exports = async function (ctx) {
    let lock
	try {
		const payload = ctx.params.body;

        lock = await this.broker.cacher.lock(
			`id_${payload.orderId}`,
			20*1000
		)
        
        const updatedOrder = await this.broker.call('v1.OrderModel.findOneAndUpdate', [
            { id: payload.orderId, paymentStatus: orderConstant.PAYMENTSTATUS.UNPAID},
            {
                $set: {
                    paymentStatus: payload.paymentStatus,
                }
            },
            {
                new: true
            }
        ])

        if (_.get(updatedOrder, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}
        return {
            code: 1000,
            message: this.__('succeed'),
            data: updatedOrder
        };
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Update Order: ${err.message}`);
	} finally {
		if (_.isFunction(lock)) {
			lock()
		}
	}
};
