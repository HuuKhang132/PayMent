const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials
		await this.broker.call('v1.User.default', {...user}) //authorization
		
		const payload = ctx.params.input;

		const userWallet = await this.broker.call('v1.WalletModel.findOne', [
            { userId: user.id },
        ])
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: user.id,
                walletId: userWallet.id,
                total: payload.amount,
                type: transactionConstant.TYPE.WITHDRAW,
				supplier: payload.supplier
            }
        }, { timeout: 30*1000 })

		if (transactionCreate.code === 1001){
			return {
				code: 1001,
				message: this.__('failed'),
			}
		}

		return {
			code: 1000,
			message: this.__('succeed'),
            data: {
                transaction: transactionCreate.data.transaction,
                otp: transactionCreate.data.otp,
            }
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Transfer: ${err.message}`);
	}
};
