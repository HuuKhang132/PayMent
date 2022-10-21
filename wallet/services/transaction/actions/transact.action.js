const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../constants/transactionConstant')
const otpConstant = require('../../otpModel/constants/otpConstant')
const orderConstant = require('../constants/orderConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        let otp
        if ( payload.isAuth !== "TRUE") {
            otp = await this.broker.call('v1.OtpModel.findOne', [{ userId: payload.userId, otp: payload.otp, transactionId: payload.transactionId, status: otpConstant.STATUS.ACTIVE }])
            if ( !otp ) {
                return {
                    code: 1001,
                    message: 'Thất bại',
                };
            }
        }   

        let transaction =  await this.broker.call('v1.TransactionModel.findOne', [
            { id: payload.transactionId, status: transactionConstant.STATUS.PENDING },
        ]);
        if (_.get(transaction, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
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
            transaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
                { id: transaction.id },
                { status: transactionConstant.STATUS.FAILED },
                { new: true }
            ]);
            if (!transaction) {
                return {
                    code: 1001,
                    message: 'Thất bại! Cập nhật giao dịch [FAILD] không thành công!',
                };
            }
        }

        const incProviderWalletBalance = await this.broker.call('v1.Wallet.changeWalletBalance', { 
            body: {
                walletId: transaction.destWalletId,
                amount: transaction.total,
                type: changeBalanceConstant.CHANGE.INC,
                transactionId: transaction.id
            } 
        }, { timeout: 20*1000 })
        if ( incProviderWalletBalance.code = 1001 ) {
            transaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
                { id: transaction.id },
                { status: transactionConstant.STATUS.FAILED },
                { new: true }
            ]);
            if (!transaction) {
                return {
                    code: 1001,
                    message: 'Thất bại! Cập nhật giao dịch [FAILD] không thành công!',
                };
            }
        }

        transaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
            { id: transaction.id },
            { status: transactionConstant.STATUS.SUCCEED },
            { new: true }
        ]);
        if (!transaction) {
            return {
                code: 1001,
                message: 'Thất bại! Cập nhật giao dịch [SUCCEED] không thành công!',
            };
        }

        if ( payload.isAuth !== "TRUE") {
            const updatedOtp = await this.broker.call('v1.OtpModel.findOneAndUpdate', [
                { otp: otp.otp, userId: payload.userId }, 
                { status: otpConstant.STATUS.DEACTIVE }
            ])
            if ( !updatedOtp ) {
                return {
                    code: 1001,
                    message: 'Thất bại',
                };
            }
        }

        if ( transaction.orderId !== null) {
            const updatedOrder =  await this.broker.call('v1.OrderModel.findOneAndUpdate', [
                { id: transaction.orderId, paymentStatus: orderConstant.PAYMENTSTATUS.UNPAID }, 
                { status: orderConstant.PAYMENTSTATUS.PAID }
            ])
            if (_.get(updatedOrder, 'id', null) === null) {
                return {
                    code: 1001,
                    message: 'Thất bại',
                };
            }
        }

		return {
			code: 1000,
			message: 'Thành công',
            item: transaction,
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Transact: ${err.message}`);
	}
};
