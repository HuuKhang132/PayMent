const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../constants/transactionConstant')

module.exports = async function (ctx) {
	try {
        const date = Date.now()
        const expiredTransaction = await this.broker.call('v1.TransactionModel.findMany', [
            { createdAt: { $lt: new Date(date-60*60*1000) }, status: transactionConstant.STATUS.PENDING },
            null,
            { limit: 20 }
        ], { timeout: 30*1000 })
        const listExpiredTransactionId = expiredTransaction.map(transaction => {
            return transaction.id
        })
        return listExpiredTransactionId
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Get list Expired: ${err.message}`);
	}
};
