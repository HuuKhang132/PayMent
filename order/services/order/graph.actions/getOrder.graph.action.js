const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials
        await this.broker.call('v1.User.default', {...user}) //authorization

        const orderId = ctx.params.input.id

		const userInfo = await this.broker.call('v1.AccountModel.findOne', [{id: user.id}])

		let order = await this.broker.call('v1.OrderModel.findOne', [{userId: user.id, id: orderId}])
		if (_.get(order, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__("failed"),
			};
		}

		order = {
			user: userInfo,
			...order
		}
		delete order.userId

		return {
			code: 1000,
			message: this.__("succeed"),
            data: order
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Get Order: ${err.message}`);
	}
};
