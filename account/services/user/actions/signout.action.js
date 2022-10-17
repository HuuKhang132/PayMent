const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const user = ctx.meta.auth.credentials
        const signedOut = await this.broker.call('v1.JwtModel.delete', [
            { jwtId: user.jti }
        ])
		console.log("signedOut  ", signedOut)

		if ( signedOut.deletedCount === 0) {
			return {
				code: 1001,
				message: 'Thất bại!',
			};
		}

		return {
			code: 1000,
			message: `Thành công!`,
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
