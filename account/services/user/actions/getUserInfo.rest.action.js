const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.params;
		const userInfo = await this.broker.call('v1.AccountModel.findOne', [{ id: payload.id }]);
		if ( _.get(userInfo, 'id', null) == null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		const responseUserInfo = _.pick(userInfo, ['id', 'fullname', 'email', 'phone', 'username', 'gender', 'avatar'])

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
