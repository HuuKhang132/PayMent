const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params;
		const walletInfo = await this.broker.call('v1.WalletModel.findOne', [{ userId: payload.userId }]);

		return walletInfo
        
	} catch (err) {
        console.log('ERR', err);
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] GetBalance: ${err.message}`);
	}
};
