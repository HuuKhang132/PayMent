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
        if (topupTransaction.code === 1001){
            return {
				code: 1001,
				message: 'Thất bại',
			};
        }

		const transferTransaction = await this.broker.call('v1.Wallet.transfer', {
			body: {
				userId: user.id,
				destUserId: payload.destUserId,
				amount: payload.amount,
				isAuth: "TRUE"
			}
		})
		if (transferTransaction.code === 1001){
            return {
				code: 1001,
				message: 'Thất bại',
			};
        }

        return transferTransaction

	} catch (err) {
		console.log("err  ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Bank to Wallet: ${err.message}`);
	}
};
