const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials;
        console.log("payload  ", user)

        if (payload.newPassword !== payload.reNewPassword) {
            return {
				code: 1001,
				message: 'Thất bại!',
			};
        }

        const hashPasswork = await bcrypt.hash(payload.newPassword, 10)

		let userInfo;
		userInfo = await this.broker.call('v1.AccountModel.findOneAndUpdate', [
            { id: user.id },
            { $set: { password: hashPasswork } },
            { new: true }
        ]);
        if (_.get(userInfo, 'id', null) == null) {
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
