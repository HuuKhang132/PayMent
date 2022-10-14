const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials

        const userWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: user.id}])
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
				userId: user.id,
                walletId: userWallet.id,
                destWalletId: destinationWallet.id,
                total: payload.amount,
            }
        })

        // if (transactionCreate.code === 1001){
        //     return {
		// 		code: 1001,
		// 		message: 'Thất bại',
		// 	};
        // }

		// return {
		// 	code: 1000,
		// 	message: 'Thành công',
		// };

		return transactionCreate

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Transfer: ${err.message}`);
	}
};
