const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;
        const user = ctx.meta.auth.credentials
        
        const transaction = await this.broker.call('v1.Transaction.transact', {
            body: {
                userId: user.id,
                otp: payload.otp,
                transactionId: payload.transactionId,
            }
        })

        return transaction
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] TransactApi: ${err.message}`);
	}
};
