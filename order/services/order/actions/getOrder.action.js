const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
        const orderId = ctx.params.params.id
        const user = ctx.meta.auth.credentials

		const order = await this.broker.call('v1.OrderModel.findOne', [{userId: user.id, id: orderId}])
		if (_.get(order, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		return {
			code: 1000,
			message: 'Thành công',
            item: order
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Get Order: ${err.message}`);
	}
};
