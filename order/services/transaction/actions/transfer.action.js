const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		this.setLocale('vi')
		const payload = ctx.params.body;
		const user = ctx.meta.auth.credentials

        const userWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: user.id}])
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__("failed"),
			};
		}

        if (userWallet.balance < payload.amount){
            return {
				code: 1001,
				message: this.__("failed"),
			};
        }

		const destinationWallet = await this.broker.call('v1.WalletModel.findOne', [{id: payload.destWalletId}])
		if (_.get(destinationWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__("failed"),
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: user.id,
                walletId: userWallet.id,
                destWalletId: destinationWallet.id,
                total: payload.amount,
				type: transactionConstant.TYPE.TRANSFER,
				isAuth: payload.isAuth
            }
        }, { timeout: 30*1000 })

		// return transactionCreate
		if (transactionCreate.code === 1001){
			return {
				code: 1001,
				message: this.__("failed"),
			}
		}
		
		return {
			code: 1000,
			message: this.__("succeed"),
            data: {
                transaction: transactionCreate.data.transaction,
                otp: transactionCreate.data.otp,
            }
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Money Transfer: ${err.message}`);
	}
};
