const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const otpGenerator = require('otp-generator');
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const transactionCreateInfo = {
			walletId: payload.walletId ? payload.walletId : null,
			destWalletId: payload.destWalletId ? payload.destWalletId: null,
			total: payload.total,
            orderId: payload.orderId ? payload.orderId : null,
			type: payload.type,
			supplier: payload.supplier ? payload.supplier : null,
			supplierTransactionId: payload.supplierTransactionId ? payload.supplierTransactionId : null,
		};
		let transactionCreate; 
		transactionCreate = await this.broker.call('v1.TransactionModel.create', [transactionCreateInfo]);

        if (_.get(transactionCreate, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}


		if ( transactionCreate.type === transactionConstant.TYPE.TOPUP ) {
			transactionCreate = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
				{ id: transactionCreate.id },
				{ status: transactionConstant.STATUS.SUCCEED },
				{ new: true }
			]);
			return {
				code: 1000,
				message: 'Thành công',
				item: transactionCreate,
			};
		}

		if ( transactionCreate.type === transactionConstant.TYPE.NAPAS ) {
			return {
				code: 1000,
				message: 'Thành công',
				item: transactionCreate,
			};
		}

		if ( payload.isAuth === "TRUE" ) {
			let transaction
			if ( transactionCreate.type === transactionConstant.TYPE.TRANSFER ) {
				transaction = await this.broker.call('v1.Transaction.transact', {
					body: {
						userId: payload.userId,
						transactionId: transactionCreate.id,
						isAuth: payload.isAuth
					}
				})
				return transaction
			}

			if ( transactionCreate.type === transactionConstant.TYPE.WALLETOBANK ) {
				transaction = await this.broker.call('v1.Transaction.walletToBank', {
					body: {
						userId: payload.userId,
						transactionId: transactionCreate.id,
						isAuth: payload.isAuth
					}
				})
				return transaction
			}
		}

        const otp = await this.broker.call('v1.OtpModel.create', [
            {
                userId: payload.userId,
                otp: otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false }),
                transactionId: transactionCreate.id,
            }
        ])
		if (_.get(otp, 'otp', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

		return {
			code: 1000,
			message: 'Thành công',
            item: {
                transaction: transactionCreate,
                otp: otp.otp,
            }
		};
	} catch (err) {
		console.log("err   ", err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Create: ${err.message}`);
	}
};
