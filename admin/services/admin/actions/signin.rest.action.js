const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')
const JsonWebToken = require('jsonwebtoken');
const uuid = require('uuid')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;

		const adminInfo = await this.broker.call('v1.AdminModel.findOne', [{username: payload.username}]);

        if (_.get(adminInfo, 'id', null) == null) {
			return {
				code: 1001,
				message: 'Sai tài khoản hoặc mật khẩu',
			};
		}

        const passwordConpare = await bcrypt.compare(payload.password, adminInfo.password)
        if (passwordConpare === false) {
            return {
				code: 1001,
				message: 'Sai tài khoản hoặc mật khẩu',
			};
        }

        const jwtid = uuid.v4();
        const accessToken = JsonWebToken.sign(
            {
                username: adminInfo.username,
                id: adminInfo.id,
            }, 
            process.env.USER_JWT_SECRETKEY, 
            { 
                expiresIn: '24h',
                jwtid: jwtid,
            }
        );

        const tokenCreate = await this.broker.call('v1.AdminTokenModel.create', [
            { 
                jwtId: jwtid, 
                adminId: adminInfo.id, 
                expiredAt: Date.now() + 24*60*60*1000,
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
            data: {
                accessToken: accessToken,
            }
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
