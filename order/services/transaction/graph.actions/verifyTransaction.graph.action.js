const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../../transactionModel/constants/transactionConstant')
const otpConstant = require('../../otpModel/constants/otpConstant')
const orderConstant = require('../constants/orderConstant')

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials
        await this.broker.call('v1.User.default', {...user}) //authorization

        this.setLocale('vi')
		const payload = ctx.params.input;
        let otp
        otp = await this.broker.call('v1.OtpModel.findOne', [{ userId: user.id, otp: payload.otp, transactionId: payload.transactionId, status: otpConstant.STATUS.ACTIVE }])
        if ( !otp ) {
            return {
                code: 1001,
                message: this.__("failed"),
            };
        }

        let transaction =  await this.broker.call('v1.TransactionModel.findOne', [
            { id: payload.transactionId, status: transactionConstant.STATUS.PENDING },
        ]);
        if (_.get(transaction, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__("failed"),
			};
		}

        let updatedTransaction

        if ( transaction.type === transactionConstant.TYPE.WITHDRAW ) {
            //GỌI API CHUYỂN TIỀN CHO NGÂN HÀNG

            return {
                code: 1000,
                message: this.__("succeed"),         
            }
                   
        }

        if ( transaction.type === transactionConstant.TYPE.TRANSFER ) {
            updatedTransaction = await this.broker.call('v1.Transaction.updateTransaction', {
                body: {
                    transactionId: transaction.id,
                    status: transactionConstant.STATUS.SUCCEED,
                }
            });
            if ( updatedTransaction.code == 1001 ) {
                return {
                    code: 1001,
                    message: this.__('updateTransactionFailed'),
                };
            }

            const desUserWalletBalance = await this.broker.call('v1.Wallet.changeWalletBalance', { 
                body: {
                    walletId: transaction.walletId,
                    amount: transaction.total,
                    type: changeBalanceConstant.CHANGE.DES,
                    transactionId: transaction.id
                } 
            }, { timeout: 20*1000 })
            if ( desUserWalletBalance.code === 1001 ) {
                return {
                    code: 1001,
                    message: this.__('updateWalletFailed'),
                };
            }

            const incProviderWalletBalance = await this.broker.call('v1.Wallet.changeWalletBalance', { 
                body: {
                    walletId: transaction.destWalletId,
                    amount: transaction.total,
                    type: changeBalanceConstant.CHANGE.INC,
                    transactionId: transaction.id
                } 
            }, { timeout: 20*1000 })
            if ( incProviderWalletBalance.code === 1001 ) {
                return {
                    code: 1001,
                    message: this.__('updateWalletFailed'),
                };
            }
        }

        const updatedOtp = await this.broker.call('v1.OtpModel.findOneAndUpdate', [
            { otp: otp.otp, userId: user.id, status: otpConstant.STATUS.ACTIVE }, 
            { status: otpConstant.STATUS.DEACTIVE }
        ])
   
        if ( transaction.orderId !== null) {
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

            updatedTransaction.data.transaction = {
                order: updatedOrder.data,
                ...updatedTransaction.data.transaction
            }
        }

		return {
			code: 1000,
			message: this.__("succeed"),
            data: {
                transaction: updatedTransaction.data.transaction,
            }
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Transact: ${err.message}`);
	}
};
