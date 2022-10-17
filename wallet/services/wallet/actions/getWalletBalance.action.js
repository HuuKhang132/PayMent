const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.params;
		const filter = payload;
		let walletInfo;
		walletInfo = await this.broker.call('v1.WalletModel.findMany', [filter]);
		if (_.isNil(walletInfo) && _.get(walletInfo[0], 'id', null) == null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		return {
			code: 1000,
			message: 'Thành công',
			items: {
				balance: walletInfo[0].balance
			}
		};
	} catch (err) {
        console.log('ERR', err);
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] GetBalance: ${err.message}`);
	}
};
