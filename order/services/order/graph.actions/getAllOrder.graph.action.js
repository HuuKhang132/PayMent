const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials
        await this.broker.call('v1.User.default', {...user}) //authorization

		const payload = ctx.params.input
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
				message: this.__("failed"),
			};
		}

		return {
			code: 1000,
			message: this.__("succeed"),
            data: {
                listOrder: order
            },
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Get All: ${err.message}`);
	}
};
