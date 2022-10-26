const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
    let lock
	try {
		const payload = ctx.params.body;
        const supplierTransactionId = payload.supplierTransactionId ? payload.supplierTransactionId : null
        lock = await this.broker.cacher.lock(
			`id_${payload.transactionId}`,
			20*1000
		)
        
        const updatedTransaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
            { id: payload.transactionId, status: transactionConstant.STATUS.PENDING },
            {
                $set: {
                    status: payload.status,
                    supplierTransactionId: supplierTransactionId
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
            data: {
                transaction: updatedTransaction
            }
        };
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Update Transaction: ${err.message}`);
	} finally {
		if (_.isFunction(lock)) {
			lock()
		}
	}
};
