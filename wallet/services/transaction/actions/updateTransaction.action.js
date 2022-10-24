const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        
        const updatedTransaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
            { id: payload.transactionId },
            {
                $set: {
                    status: payload.status,
                    supplierTransactionId: payload.supplierTransactionId
                }
            },
            {
                new: true
            }
        ])

        if (_.get(updatedTransaction, 'id', null) === null) {
			return {
				code: 1001,
				message: 'Thất bại',
			};
		}
        return {
            code: 1000,
            message: 'Thành công',
            item: updatedTransaction
        };
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] TransactApi: ${err.message}`);
	}
};
