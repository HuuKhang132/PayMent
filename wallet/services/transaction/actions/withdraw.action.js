const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')
const transactionConstant = require('../constants/transactionConstant')
const otpConstant = require('../../otpModel/constants/otpConstant')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials
        const otp = await this.broker.call('v1.OtpModel.findOne', [{ userId: user.id, otp: payload.otp, transactionId: payload.transactionId, status: otpConstant.STATUS.ACTIVE }])
        if (_.get(otp, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

        let transaction =  await this.broker.call('v1.TransactionModel.findOne', [
            { id: payload.transactionId, status: transactionConstant.STATUS.PENDING },
        ]);
        if (_.get(transaction, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

        const desUserWalletBalance = await this.broker.call('v1.Wallet.changeWalletBalance', { 
            body: {
                walletId: transaction.walletId,
                amount: transaction.total,
                type: changeBalanceConstant.CHANGE.DES,
            } 
        })

        if ( desUserWalletBalance.code = 1001 ) {
            transaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
                { id: transaction.id },
                { status: transactionConstant.STATUS.FAILED },
                { new: true }
            ]);
        }

        transaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
            { id: transaction.id },
            { status: transactionConstant.STATUS.SUCCEED },
            { new: true }
        ]);

        await this.broker.call('v1.OtpModel.findOneAndUpdate', [
            { id: otp.id }, 
            { status: otpConstant.STATUS.DEACTIVE }
        ])

		return {
			code: 1000,
			message: 'Thành công',
            item: transaction,
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Create: ${err.message}`);
	}
};
