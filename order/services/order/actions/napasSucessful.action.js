const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');
const napasConstant = require('../constants/napasConstant')

module.exports = async function (ctx) {
	try {
        const payload = ctx.params.body;
        console.log("payload  ", payload)
        
        if (payload.status === napasConstant.STATUS.SUCCEED ){
            const paidOrder = await this.broker.call('v1.OrderModel.findOneAndUpdate', [
                { id: payload.orderId, paymentStatus: orderConstant.PAYMENTSTATUS.UNPAID }, 
                { paymentStatus: orderConstant.PAYMENTSTATUS.PAID },
                { new: true }
            ])
            if (_.get(paidOrder, 'id', null) === null) {
                return {
                    code: 1001,
                    message: 'Thất bại updateorder',
                };
            }

            const updatedTransaction = await this.broker.call('v1.Transaction.updateTransaction', {
                body: {
                    transactionId: payload.transactionId,
                    status: payload.status,
                    supplierTransactionId: payload.supplierTransactionId
                }
            })
            console.log("updatedTransaction  ", updatedTransaction)
            if ( updatedTransaction.code === 1001 ) {
                return {
                    code: 1001,
                    message: 'Thất bại updateTrans',
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
                message: 'Thanh toán thất bại!',
            };
        }

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Pay: ${err.message}`);
	}
};
