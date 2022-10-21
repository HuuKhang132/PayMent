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

		const walletToBankTransaction = await this.broker.call('v1.Wallet.walletToBank', {
            body: {
				userId: user.id,
                supplier: payload.destSupplier,
                amount: payload.amount,
				isAuth: "TRUE"
            }
        }, { timeout: 30*1000 })
		if (walletToBankTransaction.code === 1001){
            return {
				code: 1001,
				message: 'Thất bại',
			};
        }

        return walletToBankTransaction

	} catch (err) {
		console.log("err  ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Bank to Wallet: ${err.message}`);
	}
};
