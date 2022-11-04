const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const accountConstant = require('../../accountModel/constants/accountConstant')

module.exports = async function (ctx) {
	try {
		const user = ctx.meta.auth.credentials
        await this.broker.call('v1.User.default', {...user}) //authorization

        const payload = ctx.params.input

        if ( _.values(accountConstant.GENDER).indexOf(payload.gender) == -1 ) {
            throw new MoleculerError(`Gender must be "MALE" or "FEMALE"`);
        }

        let phoneNumber = /(([0-9]{10})\b)/g;
        if (phoneNumber.test(payload.phone) == false ) {
            throw new MoleculerError(`Phone number is invalid`);
        }

        const updatedUser = await this.broker.call('v1.AccountModel.findOneAndUpdate', [
            { id: user.id },
            { 
                email: payload.email,
                fullname: payload.fullname,
                phone: payload.phone,
                gender: payload.gender,
                avatar: payload.avatar,
            },
            {
                new: true
            }
        ])
        if (_.get(updatedUser, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

        const updatedWallet = await this.broker.call('v1.WalletModel.findOneAndUpdate', [
            { userId: updatedUser.id },
            { $set: { fullname: updatedUser.fullname } },
            { new: true }
        ])
        if (_.get(updatedWallet, 'id', null) === null) {
			return {
				code: 1001,
				message: this.__('failed'),
			};
		}

		return {
			code: 1000,
			message: this.__('succeed'),
            data: updatedUser
		};
	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Account] Signin: ${err.message}`);
	}
};
