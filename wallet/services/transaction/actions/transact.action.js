const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../../transactionModel/constants/transactionConstant')
const otpConstant = require('../../otpModel/constants/otpConstant')
const orderConstant = require('../constants/orderConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials
        let otp
        otp = await this.broker.call('v1.OtpModel.findOne', [{ userId: user.id, otp: payload.otp, transactionId: payload.transactionId, status: otpConstant.STATUS.ACTIVE }])
        if ( !otp ) {
            return {
                code: 1001,
                message: 'Thất bại OTP',
            };
        }

        let transaction =  await this.broker.call('v1.TransactionModel.findOne', [
            { id: payload.transactionId, status: transactionConstant.STATUS.PENDING },
        ]);
        if (_.get(transaction, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại TRANSACTION',
			};
		}

        let updatedTransaction

        if ( transaction.type === transactionConstant.TYPE.WITHDRAW ) {
            //GỌI API CHUYỂN TIỀN CHO NGÂN HÀNG

            //GIẢ SỬ NGÂN HÀNG GỌI IPN RESPONSE
            return {
                code: 1000,
                message: "Thành công!",         
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
                    message: 'Cập nhật Giao dịch thất bại! [SUCCEED]',
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
                    message: 'Cập nhật số dư ví thất bại!',
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
                    message: 'Cập nhật số dư ví thất bại!',
                };
            }
        }

        const updatedOtp = await this.broker.call('v1.OtpModel.findOneAndUpdate', [
            { otp: otp.otp, userId: user.id, status: otpConstant.STATUS.ACTIVE }, 
            { status: otpConstant.STATUS.DEACTIVE }
        ])
        if ( !updatedOtp ) {
            return {
                code: 1001,
                message: 'Thất bại update OTP!',
            };
        }

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
                    message: 'Cập nhật Đơn hàng thất bại!',
                };
            }
        }

		return {
			code: 1000,
			message: 'Thành công',
            data: {
                transaction: updatedTransaction.data.transaction,
            }
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Transact: ${err.message}`);
	}
};
