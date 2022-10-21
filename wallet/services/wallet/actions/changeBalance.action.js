const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
let lock

module.exports = async function (ctx) {
	try {
        const payload = ctx.params.body;

		const wallet = await this.broker.call('v1.WalletModel.findOne', [
            { id: payload.walletId },
        ])
		if (_.get(wallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		lock = await this.broker.cacher.lock(
			`id_${wallet.id}`,
			5000
		)

		let changeType
		payload.type === changeBalanceConstant.CHANGE.INC ? changeType = 1 : changeType = -1;

		const updatedWallet = await this.broker.call('v1.WalletModel.findOneAndUpdate', [
            { id: payload.walletId },
            { $inc: {balance: changeType * payload.amount} },
            { new: true}
        ])
		if (_.get(updatedWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const walletHisoryCreate = await this.broker.call('v1.WalletHistoryModel.create', [
			{
				walletId: wallet.id,
				transactionId: payload.transactionId,
				balanceBefore: wallet.balance,
				balanceAfter: updatedWallet.balance
			}
		])
		if (_.get(walletHisoryCreate, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Tạo lịch sử Ví thất bại!',
			};
		}

        return {
            code: 1000,
            message: 'Thành công!',
        };
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Change Balance: ${err.message}`);
	} finally {
		if (_.isFunction(lock)) {
			lock()
		}
	}
};
