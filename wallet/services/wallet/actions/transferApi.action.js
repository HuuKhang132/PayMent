const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials

        const transactionCreate = await this.broker.call('v1.Wallet.transfer', {
			body: {
				userId: user.id,
				destUserId: payload.destUserId,
				amount: payload.amount,
				isAuth: "FALSE"
			}
		})

		return transactionCreate

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Transfer: ${err.message}`);
	}
};
