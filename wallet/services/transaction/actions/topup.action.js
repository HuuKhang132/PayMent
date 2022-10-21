const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../constants/transactionConstant')
const otpConstant = require('../../otpModel/constants/otpConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;

        let updatedTransaction
        if ( payload.status === transactionConstant.STATUS.SUCCEED ) {
            updatedTransaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
                { id: payload.transactionId },
                { 
                    $set: {
                        status: transactionConstant.STATUS.SUCCEED,
                        supplierTransactionId: payload.supplierTransactionId,
                    }
                },
                { new: true }
            ])


            const updatedWallet = await this.broker.call('v1.Wallet.changeWalletBalance', { 
                body: {
                    walletId: updatedTransaction.destWalletId,
                    amount: updatedTransaction.total,
                    type: changeBalanceConstant.CHANGE.INC,
                    transactionId: updatedTransaction.id
                } 
            }, { timeout: 20*1000 })
            if ( updatedWallet.code === 1001 ) {
                const transactionFailed = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
                    { id: updatedTransaction.id },
                    { status: transactionConstant.STATUS.FAILED },
                    { new: true }
                ]);
                if (!transactionFailed) {
                    return {
                        code: 1001,
                        message: 'Thất bại! Cập nhật giao dịch [FAILD] không thành công!',
                    };
                }
            }
        }

        if ( payload.status === transactionConstant.STATUS.FAILED ) {
            updatedTransaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
                { id: updatedTransaction.id },
                { 
                    $set: {
                        status: transactionConstant.STATUS.FAILED,
                        supplierTransactionId: payload.supplierTransactionId,
                    }
                },
                { new: true }
            ])
            
        }

        console.log("updatedTransaction  ", updatedTransaction)
        return {
            code: 1000,
            message: 'Thành công',
            item: updatedTransaction,
        };
        
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Top Up: ${err.message}`);
	}
};
