const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const JasonWebToken = require('jsonwebtoken')

module.exports = async function (ctx) {
	try {
        console.log(ctx)
        // const jwt = ctx.params.header.authorization;
        // const decoded = JasonWebToken.verify(jwt, process.env.USER_JWT_SECRETKEY);
        
        // await this.broker.call('v1.JwtBlacklist.create', [
        //     { jwt: jwt, expiredAt: new Date(decoded.exp)}
        // ])

		// return {
		// 	code: 1000,
		// 	message: `Thành công!`,
		// };
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
