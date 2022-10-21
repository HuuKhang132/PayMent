const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials
		const transaction = await this.broker.call('v1.Wallet.walletToBank', {
            body: {
				userId: user.id,
                supplier: payload.supplier,
                amount: payload.amount,
				isAuth: "FALSE"
            }
        }, { timeout: 30*1000 })

		return transaction

	} catch (err) {
		console.log("err   ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] TransferApi: ${err.message}`);
	}
};
