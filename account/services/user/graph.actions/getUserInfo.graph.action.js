const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const user = ctx.meta.auth.credentials
		await this.broker.call('v1.User.default', {...user}) //authorization

		const payload = ctx.params.input;
		const userInfo = await this.broker.call('v1.AccountModel.findOne', [{ id: payload.id }]);
		if ( _.get(userInfo, 'id', null) == null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		const responseUserInfo = _.pick(userInfo, ['fullname', 'email', 'phone', 'username', 'gender', 'avatar'])

		return {
			code: 1000,
			message: this.__('succeed'),
			data: {
				user: responseUserInfo
			}

		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] GetUserInfo: ${err.message}`);
	}
};
