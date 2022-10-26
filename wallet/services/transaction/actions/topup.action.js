const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials

        const wallet = await this.broker.call('v1.WalletModel.findOne', [
            { userId: user.id },
        ])
		if (_.get(wallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
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
				message: 'Thất bại',
			};
		}

        const transaction = transactionCreate.data.transaction
        console.log("transaction  ", transaction)

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
                    message: 'Cập nhật Giao dịch thất bại!',
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
                    message: 'Cập nhật số dư ví thất bại!',
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
            if ( _.get(updatedTransaction, 'id', null) === null ) {
                return {
                    code: 1001,
                    message: 'Cập nhật Giao dịch thất bại!',
                };
            }
        }

        return {
            code: 1000,
            message: 'Thành công',
            data: {
                transaction: updatedTransaction,
            }
        };
        
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Top Up: ${err.message}`);
	}
};
