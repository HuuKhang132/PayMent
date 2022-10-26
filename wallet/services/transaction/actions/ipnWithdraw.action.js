const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')
const changeBalanceConstant = require('../constants/changeBalanceConstant')
module.exports = async function (ctx) {
	try {
        const payload = ctx.params.body;

        const transaction = await this.broker.call('v1.TransactionModel.findOne', [{ id: payload.transactionId }])
        if (_.get(transaction, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}
        
        if (payload.status === transactionConstant.STATUS.SUCCEED) {
            updatedTransaction = await this.broker.call('v1.Transaction.updateTransaction', {
                body: {
                    transactionId: transaction.id,
                    status: transactionConstant.STATUS.SUCCEED,
                    supplierTransactionId: payload.supplierTransactionId
                }
            });
            if ( updatedTransaction.code === 1001 ) {
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
        }

        if (payload.status === transactionConstant.STATUS.FAILED) {
            updatedTransaction = await this.broker.call('v1.Transaction.updateTransaction', {
                body: {
                    transactionId: transaction.id,
                    status: transactionConstant.STATUS.FAILED,
                    supplierTransactionId: payload.supplierTransactionId
                }
            });
            if ( updatedTransaction.code == 1001 ) {
                return {
                    code: 1001,
                    message: 'Cập nhật Giao dịch thất bại! [FAILED]',
                };
            }
        }

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] IPN Withdraw: ${err.message}`);
	}
};
