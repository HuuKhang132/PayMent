const _ = require('lodash');

const { MoleculerError } = require('moleculer').Errors;
const JsonWebToken = require('jsonwebtoken')
const { faker } = require('@faker-js/faker')
const MongoClient = require("mongodb").MongoClient;
const uuid = require('uuid')


module.exports = async function (ctx) {
	const client = new MongoClient(process.env.MONGO_URI_FE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		keepAlive: true,
	});
    const numberOfUser = 10000
	try {
		await client.connect();
        const transactionModel = client.db("test").collection("transaction");

		// await transactionModel.drop();

		const payload = ctx.params.body;

		let transactionList = []

		let previousTransactionCreateTime = '2018-01-01T00:00:00.000Z'

		for (let i = 1; i < payload.quantity+1; i++) {
			if (i%10000 === 0) {
				console.log(i)
			}
            
            let type
            let status
            let supplier
            let supplierTransactionId

            const typeRandom = (Math.floor(Math.random() * 10) + 1)%3; //ra ket qua 1 -> 3 || 1: TRANSFER, 2: TOPUP, 3: WITHDRAW
            switch (typeRandom) {
                case 0:
                    type = 'TRANSFER'
                    break;

                case 1:
                    type = 'TOPUP'
                    break;

                case 2:
                    type = 'WITHDRAW'
                    break;
            }

            if ( typeRandom === 2 || typeRandom === 3 ) {
                supplier = 'VIETCOMBANK'
                supplierTransactionId = uuid.v4()
            }

            const statusRandom = (Math.floor(Math.random() * 10) + 1)%3;
            switch (statusRandom) {
                case 0:
                case 1:
                    status = 'SUCCEED'
                    break;

                case 2:
                    status = 'FAILED'
                    break;
            }

            const total = (Math.floor(Math.random() * 10) + 1)*100

            const walletId = Math.floor(Math.random() * numberOfUser) + 1;
            let destWalletId = Math.floor(Math.random() * numberOfUser) + 1;

            while (destWalletId === walletId ) {
                destWalletId = Math.floor(Math.random() * numberOfUser) + 1;
            }

			createAt = faker.date.future(0.000008, previousTransactionCreateTime)

            //hardcode chỉ tạo transaction TRANSFER
            type = 'TRANSFER'

            
			const transationCreateInfo = {
				walletId: type === 'TOPUP' ? null :  walletId,
                destWalletId: type === 'WITHDRAW' ? null :  destWalletId,
                status: status,
                orderId: null,
                total: total,
                type: type,
                supplierTransactionId: supplierTransactionId,
                supplier: supplier,
				createAt: createAt,
				updatedAt: createAt,
                id: i
			};
			transactionList.push(transationCreateInfo)

			previousTransactionCreateTime = createAt
		}

		await transactionModel.insertMany(transactionList)
        
		return {
			code: 1000,
			message: 'Thành công!',
		};

	} catch (err) {
		console.log(err)
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Generate] Generate Account: ${err.message}`);
	}
};
