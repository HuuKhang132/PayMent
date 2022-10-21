const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')
const JsonWebToken = require('jsonwebtoken');
const uuid = require('uuid')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;

		const userInfo = await this.broker.call('v1.AccountModel.findOne', [{username: payload.username}]);

        if (_.get(userInfo, 'id', null) == null) {
			return {
				code: 1001,
				message: 'Sai tài khoản hoặc mật khẩu',
			};
		}

        const passwordConpare = await bcrypt.compare(payload.password, userInfo.password)

        if (passwordConpare === false) {
            return {
				code: 1001,
				message: 'Sai tài khoản hoặc mật khẩu',
			};
        }

        const jwtid = uuid.v4();
        const accessToken = JsonWebToken.sign(
            {
                username: userInfo.username,
                id: userInfo.id,
                //deviceId: payload.deviceId
            }, 
            process.env.USER_JWT_SECRETKEY, 
            { 
                expiresIn: '24h',
                jwtid: jwtid,
            }
        );

        //lưu lại id, userId, expiredAt của token vừa tạo để xác thực sau này
        const tokenCreate = await this.broker.call('v1.TokenModel.create', [
            { 
                jwtId: jwtid, 
                userId: userInfo.id, 
                expiredAt: Date.now() + 24*60*60*1000,
                //deviceId: deviceId
            }
        ])
        if (_.get(tokenCreate, 'jwtId', null) == null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		return {
			code: 1000,
			message: 'Thành công',
            items: {
                accessToken: accessToken,
            }
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
