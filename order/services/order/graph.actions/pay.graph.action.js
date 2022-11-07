const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');
const transactionConstant = require('../constants/transactionConstant')

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials
		await this.broker.call('v1.User.default', {...user}) //authorization

        const payload = ctx.params.input;

		const order = await this.broker.call('v1.OrderModel.findOne', [{id: payload.orderId, paymentStatus: orderConstant.PAYMENTSTATUS.UNPAID}])
		if (_.get(order, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}
		
		const userWallet = await this.broker.call('v1.Wallet.getWallet', {userId: user.id})
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		if ( userWallet.balance < order.total ){
			return {
				code: 1001,
				message: 'Số tiền trong tài khoản không đủ!',
				data: order,
			};
		}

		const providerWallet = await this.broker.call('v1.Wallet.getWallet', {userId: order.providerId})
		if (_.get(providerWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
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

		//return transactionCreate
		if (transactionCreate.code === 1001){
			return {
				code: 1001,
				message: this.__('failed'),
			}
		}

		transactionCreate.data.transaction = {
			order: order,
			...transactionCreate.data.transaction
		}

		return {
			code: 1000,
			message: this.__('succeed'),
            data: {
                transaction: transactionCreate.data.transaction,
                otp: transactionCreate.data.otp,
            }
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Pay: ${err.message}`);
	}
};
