const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials
		const payload = ctx.params.query
		const limit = parseInt(payload.limit, 10)
		const page = parseInt(payload.page, 10)
		const skip = (page - 1)*limit

		const order = await this.broker.call('v1.OrderModel.findMany', [
			{ userId: user.id },
			null,
			{ 
				sort: {id: -1},
				skip: skip,
				limit: limit,
			}
		])
		if (_.isNil(order) && _.get(order[0], 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		return {
			code: 1000,
			message: 'Thành công',
            data: {
                listOrder: order
            },
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Get All: ${err.message}`);
	}
};
