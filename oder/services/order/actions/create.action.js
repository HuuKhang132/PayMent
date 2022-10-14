const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const orderConstant = require('../../orderModel/constants/orderConstant');

module.exports = async function (ctx) {
	try {
		console.log("ctx.params   ", ctx.params)
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials

		const userWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: user.id}])
		if (_.get(userWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		const providerWallet = await this.broker.call('v1.WalletModel.findOne', [{userId: payload.providerId}])
		if (_.get(providerWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
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
		let orderCreate;
		orderCreate = await this.broker.call('v1.OrderModel.create', [orderCreateInfo]);
		console.log("orderCreate   ", orderCreate)

        if (_.get(orderCreate, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		if ( payload.paymentMethod === orderConstant.PAYMENTMETHOD.BANK ){
			return {
				code: 1000,
				message: 'Thành công',
				item: {
					url: "www.google.com"
				},
			};
		}

		if ( payload.paymentMethod === orderConstant.PAYMENTMETHOD.WALLET && userWallet.balance < orderCreate.total ){
			return {
				code: 1001,
				message: 'Số tiền trong tài khoản không đủ!',
				item: orderCreate,
			};
		}

		const transactionCreate = await this.broker.call('v1.Transaction.create', {
            body: {
				userId: user.id,
                walletId: userWallet.id,
                destWalletId: providerWallet.id,
                total: orderCreate.total,
                orderId: orderCreate.id
            }
        })

        // if (transactionCreate.code === 1001){
        //     return {
		// 		code: 1001,
		// 		message: 'Thất bại',
		// 	};
        // }

        // const paidOrder = await this.broker.call('v1.OrderModel.findOneAndUpdate', [
        //     { id: orderCreate.id },
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
		console.log("err   ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Create: ${err.message}`);
	}
};
