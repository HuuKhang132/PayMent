const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
		
		const userWallet = await this.broker.call('v1.WalletModel.findOne', [
            { userId: payload.userId },
        ])
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: payload.userId,
                walletId: userWallet.id,
                total: payload.amount,
                type: transactionConstant.TYPE.WALLETOBANK,
				supplier: payload.supplier,
                isAuth: payload.isAuth
            }
        }, { timeout: 30*1000 })

		return transactionCreate

	} catch (err) {
        
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Transfer: ${err.message}`);
	}
};
