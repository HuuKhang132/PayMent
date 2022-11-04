const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials
        await this.broker.call('v1.User.default', {...user}) //authorization
		
        const payload = ctx.params.input;

        const wallet = await this.broker.call('v1.WalletModel.findOne', [
            { userId: user.id },
        ])
		if (_.get(wallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: user.id,
                destWalletId: wallet.id,
                total: payload.amount,
                type: transactionConstant.TYPE.TOPUP,
				supplier: payload.supplier
            }
        }, { timeout: 30*1000 })

		if ( transactionCreate.code == 1001 ) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

        const transaction = transactionCreate.data.transaction

		//GỌI API BÊN NGÂN HÀNG: YÊU CẦU CHUYỂN TIỀN ĐẾN VÍ
		//SAU KHI NGÂN HÀNG XỬ LÍ SẼ TRẢ VỀ KẾT QUẢ GIAO DỊCH -> XỬ LÍ SỐ DƯ TRONG VÍ
		const bankResponse = await this.broker.call('v1.Transaction.bankApiExample')

        let updatedTransaction
        if ( bankResponse.data.status === transactionConstant.STATUS.SUCCEED ) {
            updatedTransaction = await this.broker.call('v1.Transaction.updateTransaction', {
                body: {
                    transactionId: transaction.id,
                    status: transactionConstant.STATUS.SUCCEED,
                    supplierTransactionId: bankResponse.data.supplierTransactionId
                }
            })
            if ( updatedTransaction.code === 1001 ) {
                return {
                    code: 1001,
                    message: this.__('updateTransactionFailed'),
                };
            }

            const updatedWallet = await this.broker.call('v1.Wallet.changeWalletBalance', { 
                body: {
                    walletId: transaction.destWalletId,
                    amount: transaction.total,
                    type: changeBalanceConstant.CHANGE.INC,
                    transactionId: transaction.id
                } 
            }, { timeout: 20*1000 })
            if ( updatedWallet.code === 1001 ) {
                return {
                    code: 1001,
                    message: this.__('updateWalletFailed'),
                };
            }
        }

        if ( bankResponse.data.status === transactionConstant.STATUS.FAILED ) {
            updatedTransaction = await this.broker.call('v1.Transaction.updateTransaction', {
                body: {
                    transactionId: transaction.id,
                    status: transactionConstant.STATUS.FAILED,
                    supplierTransactionId: bankResponse.data.supplierTransactionId
                }
            })
            if ( updatedTransaction.code === 1001 ) {
                return {
                    code: 1001,
                    message: this.__('updateTransactionFailed'),
                };
            }
        }

        return {
            code: 1000,
            message: this.__('succeed'),
            data: {
                transaction: updatedTransaction?.data?.transaction,
            }
        };
        
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Top Up: ${err.message}`);
	}
};
