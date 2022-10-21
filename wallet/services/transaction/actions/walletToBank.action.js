const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../constants/transactionConstant')
const otpConstant = require('../../otpModel/constants/otpConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        let otp
        if ( payload.isAuth !== "TRUE" ) {
            otp = await this.broker.call('v1.OtpModel.findOne', [{ userId: payload.userId, otp: payload.otp, transactionId: payload.transactionId, status: otpConstant.STATUS.ACTIVE }])
            if (_.get(otp, 'otp', null) === null) {
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

        //GIẢ SỬ GỌI API CỦA NGÂN HÀNG
        //NGÂN HÀNG SẼ TRẢ VỀ KẾT QUẢ GIAO DỊCH
        //DỰA VÀO KẾT QUẢ TRẢ VỀ ĐỂ THỰC HIỆN CÁC TÁC VỤ TIẾP THEO
        const bankResponse = await this.broker.call('v1.Transaction.bankTopup', {
			body: {
				transactionId: transaction.id
			}
		})

        if (bankResponse.data.status === "SUCCEED") {
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
                    { 
                        status: transactionConstant.STATUS.FAILED,
                        supplierTransactionId: bankResponse.data.supplierTransactionId,
                    },
                    { new: true }
                ]);
            }
    
            transaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
                { id: transaction.id },
                { 
                    status: transactionConstant.STATUS.SUCCEED,
                    supplierTransactionId: bankResponse.data.supplierTransactionId,
                },
                { new: true }
            ]);

            if ( payload.isAuth !== "TRUE" ) {
                const updatedOtp = await this.broker.call('v1.OtpModel.findOneAndUpdate', [
                    { id: otp.id }, 
                    { status: otpConstant.STATUS.DEACTIVE }
                ])
                if ( !updatedOtp ) {
                    return {
                        code: 1001,
                        message: 'Thất bại',
                    };
                }
            }
        }

        if (bankResponse.data.status === "FAILED") {
            transaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
                { id: transaction.id },
                { 
                    status: transactionConstant.STATUS.FAILED,
                    supplierTransactionId: bankResponse.data.supplierTransactionId,
                },
                { new: true }
            ]);
        }

		return {
			code: 1000,
			message: 'Thành công',
            item: transaction,
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] WithDraw: ${err.message}`);
	}
};
