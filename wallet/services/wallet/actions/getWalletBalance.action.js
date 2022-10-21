const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const user = ctx.meta.auth.credentials;
		const walletInfo = await this.broker.call('v1.WalletModel.findOne', [{ userId: user.id }]);
		if ( _.get(walletInfo, 'id', null) == null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		return {
			code: 1000,
			message: 'Thành công',
			items: {
				balance: walletInfo.balance
			}
		};
	} catch (err) {
        console.log('ERR', err);
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] GetBalance: ${err.message}`);
	}
};
