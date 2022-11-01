const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const tokenConstant = require('../../adminTokenModel/constants/tokenConstant')

module.exports = async function (ctx) {
	try {
        const payload = ctx.params;
		console.log("payload  ", payload)
		const tokenInfo = await this.broker.call('v1.TokenModel.findOne', [{jwtId: payload.jti}]);
		if ( 
			_.get(tokenInfo, 'jwtId', null) == null || 
			tokenInfo.expiredAt < Date.now() || 
			tokenInfo.state === tokenConstant.STATE.SIGNEDOUT
			//tokenInfo.deviceId
			) {
				return false;
		}
		return true;
	} catch (err) {
		console.log("err   ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Token] Authorize: ${err.message}`);
	}
};
