const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');
const napasConstant = require('../constants/napasConstant')

module.exports = async function (ctx) {
	try {
        const payload = ctx.params.body;
        
        if (payload.status === napasConstant.STATUS.SUCCEED ){
            const paidOrder = await this.broker.call('v1.OrderModel.findOneAndUpdate', [
                { id: payload.orderId, status: orderConstant.PAYMENTSTATUS.UNPAID }, 
                { status: orderConstant.PAYMENTSTATUS.PAID },
                { new: true }
            ])
            if (_.get(paidOrder, 'id', null) === null) {
                return {
                    code: 1001,
                    message: 'Thất bại',
                };
            }
            return {
                code: 1000,
                message: 'Thanh toán thành công!',
            };
        }

        if (payload.status === napasConstant.STATUS.FAILED ){
            return {
                code: 1000,
                message: 'Thanh toán thành công!',
            };
        }

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Pay: ${err.message}`);
	}
};
