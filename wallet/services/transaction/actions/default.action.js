const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params;
		const authorizeToken = await this.broker.call('v1.Token.authorize', { ...payload });
		if ( !authorizeToken ) {
			throw new MoleculerError('Thông tin xác thực không hợp lệ', 401, null, null);
		}
		return true;
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Default: ${err.message}`);
	}
};
