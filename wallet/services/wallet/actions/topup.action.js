const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;

        const wallet = await this.broker.call('v1.WalletModel.findOne', [
            { userId: payload.userId },
        ])
		if (_.get(wallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: payload.userId,
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

		//GỌI API BÊN NGÂN HÀNG: YÊU CẦU CHUYỂN TIỀN ĐẾN VÍ
		//SAU KHI NGÂN HÀNG XỬ LÍ SẼ TRẢ VỀ KẾT QUẢ GIAO DỊCH -> XỬ LÍ SỐ DƯ TRONG VÍ
		const bankResponse = await this.broker.call('v1.Transaction.bankApiExample')

		const topupTransaction = await this.broker.call('v1.Transaction.topup', {
			body: {
				transactionId: transactionCreate.item.id,
				supplierTransactionId: bankResponse.data.supplierTransactionId,
				status: bankResponse.data.status,
			}
		})

		return topupTransaction

	} catch (err) {
		console.log("err  ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Top Up: ${err.message}`);
	}
};
