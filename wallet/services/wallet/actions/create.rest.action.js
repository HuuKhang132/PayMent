const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params;
		const walletCreateInfo = payload.walletCreateInfo;

		const walletCreate = await this.broker.call('v1.WalletModel.create', [walletCreateInfo]);
		if (_.get(walletCreate, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		return {
			code: 1000,
			message: this.__('succeed'),
			data: walletCreate
		};
	} catch (err) {
        console.log('ERR', err);
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Create: ${err.message}`);
	}
};
