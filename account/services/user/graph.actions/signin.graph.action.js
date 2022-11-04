const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')
const JsonWebToken = require('jsonwebtoken');
const uuid = require('uuid')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.input;

		const userInfo = await this.broker.call('v1.AccountModel.findOne', [{username: payload.username, password: payload.password}]);

        if (_.get(userInfo, 'id', null) == null) {
			return {
				code: 1001,
				message: 'Sai tài khoản hoặc mật khẩu',
			};
		}

        // const passwordConpare = await bcrypt.compare(payload.password, userInfo.password)

        // if (passwordConpare === false) {
        //     return {
		// 		code: 1001,
		// 		message: 'Sai tài khoản hoặc mật khẩu',
		// 	};
        // }

        if ( userInfo.walletId === null) {
            let userWalletId
            const userWallet = await this.broker.call('v1.Wallet.getWallet', {userId: userInfo.id}) 
            if ( _.get(userWallet, 'id', null) !== null ) {
                userWalletId = userWallet.id
            } else {
                const walletCreateInfo = {
                    userId: userInfo.id,
                    fullname: userInfo.fullname,
                }
                const walletCreate = await this.broker.call('v1.Wallet.create', {walletCreateInfo})
                if ( walletCreate.code === 1001 ) { //tạo ví thất bại
                    return {
                        code: 1001,
                        message: 'Đăng nhập thất bại! Vui lòng thử lại',
                    };
                }
                userWalletId = walletCreate.data.id
            }

            let updatedAccount = await this.broker.call('v1.AccountModel.findOneAndUpdate', [
                { id: userInfo.id },
                {
                    $set: { walletId: userWalletId },
                },
                { new: true }
            ])
            if ( _.get(updatedAccount, 'id', null) === null ) { //tạo ví thất bại
                return {
                    code: 1001,
                    message: 'Đăng nhập thất bại! Vui lòng thử lại',
                };
            }
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
            data: {
                accessToken: accessToken,
            }
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
