const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params;
		const authorizeToken = await this.broker.call('v1.Token.authorize', { ...payload });
		console.log("authorizeToken wallet  ", authorizeToken)
		if ( !authorizeToken ) {
			throw new MoleculerError('Thông tin xác thực không hợp lệ', 401, null, null);
		}
		return true;
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Default: ${err.message}`);
	}
};
