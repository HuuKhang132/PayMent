const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');
const napasConstant = require('../constants/napasConstant')

module.exports = async function (ctx) {
	try {
        const payload = ctx.params.body;
        console.log("payload  ", payload)
        
        if (payload.status === napasConstant.STATUS.SUCCEED ){
            const updatedTransaction = await this.broker.call('v1.Transaction.updateTransaction', {
                body: {
                    transactionId: payload.transactionId,
                    status: payload.status,
                    supplierTransactionId: payload.supplierTransactionId
                }
            })
            if ( updatedTransaction.code === 1001 ) {
                return {
                    code: 1001,
                    message: 'Cập nhật Giao dịch thất bại!',
                };
            }

            const updatedOrder =  await this.broker.call('v1.Order.updateOrder', {
                body: {
                    orderId: transaction.orderId,
                    paymentStatus: orderConstant.PAYMENTSTATUS.PAID,
                }
            })
            if ( updatedOrder.code === 1001 ) {
                return {
                    code: 1001,
                    message: 'Cập nhật Đơn hàng thất bại!',
                };
            }

            return {
                code: 1000,
                message: 'Thanh toán thành công!',
            };
        }

        if (payload.status === napasConstant.STATUS.FAILED ){
            const updatedOrder =  await this.broker.call('v1.Order.updateOrder', {
                body: {
                    orderId: transaction.orderId,
                    paymentStatus: orderConstant.PAYMENTSTATUS.UNPAID,
                }
            })
            if ( updatedOrder.code === 1001 ) {
                return {
                    code: 1001,
                    message: 'Cập nhật Đơn hàng thất bại!',
                };
            }

            return {
                code: 1000,
                message: 'Thanh toán thất bại!',
            };
        }

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Napas: ${err.message}`);
	}
};
