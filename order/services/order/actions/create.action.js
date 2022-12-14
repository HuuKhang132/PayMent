const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');
const transactionConstant = require('../constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials

		const userWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: user.id}])
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__("failed"),
			};
		}

		const providerWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: payload.providerId}])
		if (_.get(providerWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__("failed"),
			};
		}

		const orderCreateInfo = {
			userId: user.id,
			total: payload.total,
			description: payload.description,
			note: payload.note,
			paymentMethod: payload.paymentMethod,
			providerId: payload.providerId
		};
		const orderCreate = await this.broker.call('v1.OrderModel.create', [orderCreateInfo]);

        if (_.get(orderCreate, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__("failed"),
			};
		}

		if ( payload.paymentMethod === orderConstant.PAYMENTMETHOD.BANK ){
			const transactionCreate = await this.broker.call('v1.Transaction.create', {
				body: {
					userId: user.id,
					total: orderCreate.total,
					orderId: orderCreate.id,
					type: transactionConstant.TYPE.NAPAS,
					supplier: transactionConstant.TYPE.NAPAS
				}
			}, { timeout: 30*1000 }) 
			if (transactionCreate.code === 1001){
				return {
					code: 1001,
					message: this.__("failed"),
				}
			}
			return {
				code: 1000,
				message: this.__("succeed"),
				data: {
					url: "www.google.com",
					transaction: transactionCreate.data.transaction,
					order: orderCreate
				},
			};
		}

		if ( payload.paymentMethod === orderConstant.PAYMENTMETHOD.WALLET && userWallet.balance < orderCreate.total ){
			return {
				code: 1001,
				message: 'S??? ti???n trong t??i kho???n kh??ng ?????!',
				data: {
					order: orderCreate
				},
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: user.id,
                walletId: userWallet.id,
                destWalletId: providerWallet.id,
                total: orderCreate.total,
                orderId: orderCreate.id,
				type: transactionConstant.TYPE.TRANSFER
            }
        }, { timeout: 30*1000 }) 

		//return transactionCreate
		if (transactionCreate.code === 1001){
			return {
				code: 1001,
				message: this.__("failed"),
			}
		}

		return {
			code: transactionCreate.code,
			message: transactionCreate.message,
            data: {
                transaction: transactionCreate.data.transaction,
                otp: transactionCreate.data.otp,
            }
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Create: ${err.message}`);
	}
};
