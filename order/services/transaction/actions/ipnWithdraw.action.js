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
				message: this.__('failed'),
			};
		}

        let updatedTransaction
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
            
            return {
                code: 1000,
                message: this.__('succeed')
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
                    message: this.__('updateTransactionFailed'),
                };
            }

            return {
                code: 1000,
                message: this.__('failed')
            }
        }

        

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] IPN Withdraw: ${err.message}`);
	}
};
