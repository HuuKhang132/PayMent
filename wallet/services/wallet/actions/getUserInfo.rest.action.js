const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.params;
		const userInfo = await this.broker.call('v1.AccountModel.findMany', [{ id: payload.userId }]);
		if (_.isNil(userInfo) || _.get(userInfo[0], 'id', null) == null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		return {
			code: 1000,
			message: 'Thành công',
			items: userInfo

		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] GetUserInfo: ${err.message}`);
	}
};
