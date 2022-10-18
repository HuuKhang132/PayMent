const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
        const date = Date.now()
        await this.broker.call('v1.OrderModel.deleteMany', [
            { expiredAt: { $lt: date } },
        ])
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Check Expired: ${err.message}`);
	}
};
