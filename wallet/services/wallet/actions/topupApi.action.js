const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
		const user = ctx.meta.auth.credentials

		const topupTransaction = await this.broker.call('v1.Wallet.topup', {
			body: {
				userId: user.id,
				amount: payload.amount,
				supplier: payload.supplier,
			}
		})

		return topupTransaction

	} catch (err) {
		console.log("err  ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Top Up Api: ${err.message}`);
	}
};
