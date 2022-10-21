const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;

        const userWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: payload.userId}])
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

        if (userWallet.balance < payload.amount){
            return {
				code: 1001,
				message: 'Thất bại',
			};
        }

		const destinationWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: payload.destUserId}])
		if (_.get(destinationWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: payload.userId,
                walletId: userWallet.id,
                destWalletId: destinationWallet.id,
                total: payload.amount,
				type: transactionConstant.TYPE.TRANSFER,
				isAuth: payload.isAuth
            }
        }, { timeout: 30*1000 })

		return transactionCreate

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Transfer: ${err.message}`);
	}
};
