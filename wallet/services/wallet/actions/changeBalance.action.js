const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const changeBalanceConstant = require('../constants/changeBalanceConstant')

module.exports = async function (ctx) {
	try {
        const payload = ctx.params.body;

		let changeType
		payload.type === changeBalanceConstant.CHANGE.INC ? changeType = 1 : changeType = -1;

		let updatedWallet;
		updatedWallet = await this.broker.call('v1.WalletModel.findOneAndUpdate', [
            { id: payload.walletId },
            { $inc: {balance: changeType * payload.amount} },
            { new: true}
        ])
        
		if (_.get(updatedWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}

        return {
            code: 1000,
            message: 'Thành công!',
        };
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Wallet] Change Balance: ${err.message}`);
	}
};
