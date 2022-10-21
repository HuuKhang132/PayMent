const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials

		const order = await this.broker.call('v1.OrderModel.findMany', [{userId: user.id}])
		if (_.isNil(order) && _.get(order[0], 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		return {
			code: 1000,
			message: 'Thành công',
            item: {
                listOrder: order
            },
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Get All: ${err.message}`);
	}
};
