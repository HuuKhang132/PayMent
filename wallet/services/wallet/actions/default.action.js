const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params;
        let userInfo
		userInfo = await this.broker.call('v1.AccountModel.findMany', [{id: payload.id}]);
		if (_.isNil(userInfo) || _.get(userInfo[0], 'id', null) == null) {
			throw new MoleculerError('Thông tin xác thực không hợp lệ', 401, null, null);
		}
		return true;
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Create: ${err.message}`);
	}
};
