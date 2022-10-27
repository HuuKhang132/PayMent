const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const transactionConstant = require('../../transactionModel/constants/transactionConstant')

module.exports = async function (ctx) {
    let lock;
	try {
        const payload = ctx.params.body

        lock = await this.broker.cacher.lock(
			`id_${payload.transactionId}`,
			20*1000
		)

        const expiredTransaction = await this.broker.call('v1.TransactionModel.findOneAndUpdate', [
            { id: payload.transactionId },
            { $set: { status: transactionConstant.STATUS.EXPIRED } }
        ], { timeout: 20*1000 })

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Check Expired: ${err.message}`);
	} finally {
		if (_.isFunction(lock)) {
            lock();
		}
	}
};
