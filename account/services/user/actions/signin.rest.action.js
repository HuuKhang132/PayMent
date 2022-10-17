const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')
const JsonWebToken = require('jsonwebtoken');
const uuid = require('uuid')

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

        const jwtid = uuid.v4();
        const accessToken = JsonWebToken.sign(
            {
                username: userInfo[0].username,
                id: userInfo[0].id,
            }, 
            process.env.USER_JWT_SECRETKEY, 
            { 
                expiresIn: '24h',
                jwtid: jwtid,
            }
        );

        //lưu lại id, userId, expiredAt của token vừa tạo để xác thực sau này
        await this.broker.call('v1.JwtModel.create', [
            { jwtId: jwtid, userId: userInfo[0].id, expiredAt: Date.now() + 24*60*60*1000}
        ])

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
