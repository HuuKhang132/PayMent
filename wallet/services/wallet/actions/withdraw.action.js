const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials

		const userWallet = await this.broker.call('v1.WalletModel.findOne', [
            { userId: user.id },
        ])
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: user.id,
                walletId: userWallet.id,
                total: payload.amount,
                type: transactionConstant.TYPE.WITHDRAW
            }
        })

		return transactionCreate

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Transfer: ${err.message}`);
	}
};
