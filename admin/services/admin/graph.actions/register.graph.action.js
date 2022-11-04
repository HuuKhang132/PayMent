const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.input;
		
		const hashPasswork = await bcrypt.hash(payload.password, 10)
		const adminCreateInfo = {
			username: payload.username,
			password: hashPasswork,
		};
		let adminCreate = await this.broker.call('v1.AdminModel.create', [adminCreateInfo]);
        if (_.get(adminCreate, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		return {
			code: 1000,
			message: this.__('succeed'),
		};
	} catch (err) {
        console.log('ERR', err);
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Create: ${err.message}`);
	}
};
