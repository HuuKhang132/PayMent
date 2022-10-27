const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');
const napasConstant = require('../constants/napasConstant')

module.exports = async function (ctx) {
	try {
        const payload = ctx.params.body;
        
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
                    message: this.__('updateTransactionFailed'),
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
                    message: this.__('updateOrderFailed'),
                };
            }

            return {
                code: 1000,
                message: this.__('succeed'),
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
                    message: this.__('updateOrderFailed'),
                };
            }

            return {
                code: 1000,
                message: this.__('failed'),
            };
        }

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Napas: ${err.message}`);
	}
};
