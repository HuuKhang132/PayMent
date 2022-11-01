const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const tokenConstant = require('../../tokenModel/constants/tokenConstant')

module.exports = async function (ctx) {
	try {
		const user = ctx.meta.auth.credentials
        const signedOut = await this.broker.call('v1.TokenModel.findOneAndUpdate', [
            { jwtId: user.jti },
			{ $set: { state: tokenConstant.STATE.SIGNEDOUT, logoutTime: new Date() } },
			{ new: true }
        ])
		console.log("signedOut  ", signedOut)

		if ( _.get(signedOut, 'jwtId', null) == null ) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		return {
			code: 1000,
			message: this.__('succeed'),
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
