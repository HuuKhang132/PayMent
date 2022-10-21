const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;

module.exports = async function (ctx) {
	try {
        const date = Date.now()
        const deletedToken = await this.broker.call(
			'v1.TokenModel.deleteMany', 
			[{ expiredAt: { $lt: date } }],
			{
				timeout: 20*1000
			}
		)
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Order] Check Expired: ${err.message}`);
	}
};
