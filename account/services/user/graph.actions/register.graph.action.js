const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const bcrypt = require('bcrypt')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.input;
        
		let phoneNumber = /(([0-9]{10})\b)/g;
        if (phoneNumber.test(payload.phone) == false ) {
            throw new MoleculerError(`Phone number is invalid`);
        }
		
		const hashPasswork = await bcrypt.hash(payload.password, 10)
		const accountCreateInfo = {
			email: payload.email,
			phone: payload.phone,
			username: payload.username,
			password: hashPasswork,
			fullname: payload.fullname,
			gender: payload.gender,
			avatar: payload.avatar,
		};
		let accountCreate = await this.broker.call('v1.AccountModel.create', [accountCreateInfo]);
        if (_.get(accountCreate, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

        const walletCreateInfo = {
            userId: accountCreate.id,
            fullname: accountCreate.fullname,
        }
        const walletCreate = await this.broker.call('v1.Wallet.create', {walletCreateInfo})
		if ( walletCreate.code === 1001 ) { //tạo ví thất bại
			return {
				code: 1000,
				message: this.__('failed'),
			};
		}

		let updatedAccount = await this.broker.call('v1.AccountModel.findOneAndUpdate', [
			{ id: accountCreate.id },
			{
				$set: { walletId: walletCreate.data.id },
			},
			{ new: true }
		])

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
