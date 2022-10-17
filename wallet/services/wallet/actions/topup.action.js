const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials

		const updatedWallet = await this.broker.call('v1.WalletModel.findOneAndUpdate', [
            { userId: user.id },
            { $inc: { balance: payload.amount } },
            { new: true }
        ])
		if (_.get(updatedWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: user.id,
                walletId: updatedWallet.id,
                total: payload.amount,
                type: transactionConstant.TYPE.TOPUP
            }
        })

		return transactionCreate

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Top Up: ${err.message}`);
	}
};
