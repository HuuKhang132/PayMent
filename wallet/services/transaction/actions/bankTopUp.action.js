const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const uuid = require('uuid')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body;

        const supTransId = uuid.v4()

        return {
            code: 1000,
            message: 'Thành công',
            data: {
                transactionId: payload.transactionId,
                supplierTransactionId: supTransId,
                status: "SUCCEED",
            }
        };
        
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Top Up: ${err.message}`);
	}
};
