const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
        const payload = ctx.params;
        let jwtInfo
		jwtInfo = await this.broker.call('v1.JwtModel.findOne', [{jwtId: payload.jti}]);
		console.log("jwtInfo   ", jwtInfo)
		if ( _.get(jwtInfo, 'jwtId', null) == null || jwtInfo.expiredAt < Date.now() ) {
			throw new MoleculerError('Thông tin xác thực không hợp lệ', 401, null, null);
		}
		return true;
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Create: ${err.message}`);
	}
};
