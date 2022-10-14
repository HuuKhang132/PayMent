const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')
const JsonWebToken = require('jsonwebtoken');


module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;

        //const username = payload.username;
		let userInfo;
		userInfo = await this.broker.call('v1.AccountModel.findMany', [{username: payload.username}]);

        if (_.isNil(userInfo) && _.get(userInfo[0], 'id', null) == null) {
			return {
				code: 1001,
				message: 'Sai tài khoản hoặc mật khẩu',
			};
		}

        const passwordConpare = await bcrypt.compare(payload.password, userInfo[0].password)

        if (passwordConpare === false) {
            return {
				code: 1001,
				message: 'Sai tài khoản hoặc mật khẩu',
			};
        }

        const accessToken = JsonWebToken.sign(
            {
                email: userInfo[0].email,
                phone: userInfo[0].phone,
                username: userInfo[0].username,
                id: userInfo[0].id,
            }, 
            process.env.USER_JWT_SECRETKEY, 
            { expiresIn: '24h' }
        );

		return {
			code: 1000,
			message: 'Thành công',
            items: [
                {
                    accessToken: accessToken,
                }
            ]
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
