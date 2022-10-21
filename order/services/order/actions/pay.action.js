const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');
const transactionConstant = require('../constants/transactionConstant')

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
		
		const userWallet = await this.broker.call('v1.Wallet.getWallet', {userId: user.id})
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		if ( userWallet.balance < order.total ){
			return {
				code: 1001,
				message: 'Số tiền trong tài khoản không đủ!',
				item: order,
			};
		}

		const providerWallet = await this.broker.call('v1.Wallet.getWallet', {userId: order.providerId})
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
                orderId: order.id,
				type: transactionConstant.TYPE.TRANSFER
            }
        }, { timeout: 30*1000 })

		return transactionCreate

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Pay: ${err.message}`);
	}
};
