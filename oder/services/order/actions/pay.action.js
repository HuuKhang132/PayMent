const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');

module.exports = async function (ctx) {
	try {
        const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials

		const order = await this.broker.call('v1.OrderModel.findOne', [{id: payload.orderId, paymentStatus: orderConstant.PAYMENTSTATUS.UNPAID}])
		if (_.get(order, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const userWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: user.id}])
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const providerWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: order.providerId}])
		if (_.get(providerWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: user.id,
                walletId: userWallet.id,
                destWalletId: providerWallet.id,
                total: order.total,
                orderId: order.id
            }
        })

        // if (transactionCreate.code === 1001){
        //     return {
		// 		code: 1001,
		// 		message: 'Thất bại',
		// 	};
        // }

        // const paidOrder = await this.broker.call('v1.OrderModel.findOneAndUpdate', [
        //     { id: order.id },
        //     { paymentStatus: orderConstant.PAYMENTSTATUS.PAID },
        //     { new: true }
        // ])

		// if (paidOrder.code === 1001) {
		// 	return {
		// 		code: 1001,
		// 		message: 'Thất bại',
		// 	};
		// }

		// return {
		// 	code: 1000,
		// 	message: 'Thành công',
        //     item: paidOrder,
		// };

		return transactionCreate

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Pay: ${err.message}`);
	}
};
