const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials;
		await this.broker.call('v1.User.default', {...user}) //authorization

		const payload = ctx.params.input;

        if (payload.newPassword !== payload.reNewPassword) {
            return {
				code: 1001,
				message: this.__('failed'),
			};
        }

        const hashPasswork = await bcrypt.hash(payload.newPassword, 10)

		const userInfo = await this.broker.call('v1.AccountModel.findOneAndUpdate', [
            { id: user.id },
            { $set: { password: hashPasswork } },
            { new: true }
        ]);
        if (_.get(userInfo, 'id', null) == null) {
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
