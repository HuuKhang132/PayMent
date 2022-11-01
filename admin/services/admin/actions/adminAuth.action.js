const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const tokenConstant = require('../../adminTokenModel/constants/tokenConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params;
		const authorizeToken = await this.broker.call('v1.Token.authorize', { ...payload });
		if ( !authorizeToken ) {
			throw new MoleculerError('Thông tin xác thực không hợp lệ', 401, null, null);
		}
		return true;
	} catch (err) {
		console.log("err   ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Default: ${err.message}`);
	}
};
