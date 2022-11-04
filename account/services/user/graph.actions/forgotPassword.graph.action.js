const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const nodemailer = require('nodemailer')
const JsonWebToken = require('jsonwebtoken')
const { google } = require('googleapis')
const { OAuth2 } = google.auth

const oauth2Client = new OAuth2(
	process.env.MAIL_SERVICE_CLIENT_ID,
	process.env.MAIL_SERVICE_CLIENT_SECRET,
)

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.input;
		const userInfo = await this.broker.call('v1.AccountModel.findOne', [{username: payload.username, email: payload.email}]);

        if (_.get(userInfo, 'id', null) == null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

        const resetPasswordToken = JsonWebToken.sign(
            {
                email: userInfo.email,
                phone: userInfo.phone,
                username: userInfo.username,
                id: userInfo.id,
            }, 
            process.env.USER_JWT_SECRETKEY, 
            { expiresIn: '5m' }
        );

        await oauth2Client.setCredentials({
            refresh_token: process.env.MAIL_SERVICE_REFRESH_TOKEN,
        })

        let transporter = await nodemailer.createTransport({ // config mail server
            service: 'Gmail',
            auth: {
                type: 'oauth2',
                user: process.env.SENDER_EMAIL_ADDRESS,
                pass: process.env.SENDER_EMAIL_PASSWORD,
                clientId: process.env.MAIL_SERVICE_CLIENT_ID,
                clientSecret: process.env.MAIL_SERVICE_CLIENT_SECRET,
                refreshToken: process.env.MAIL_SERVICE_REFRESH_TOKEN,
                accessToken: oauth2Client.getAccessToken(),
            }
        });
        let mainOptions = { // thiết lập đối tượng, nội dung gửi mail
            from: process.env.SENDER_EMAIL_ADDRESS,
            to: payload.email,
            subject: 'FORGOT PASSWORD PAYMENT',
            html: `Token: ${resetPasswordToken}`
        }

        await transporter.sendMail(mainOptions, function(err, info){
            if (err) {
                return {
                    code: 1001,
                    message: this.__('failed'),
                };
            } else {
                console.log('Email sent');
            }
        });

		return {
			code: 1000,
			message: `Xác nhận thay đổi mật khẩu qua mail: ${payload.email}`,
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
