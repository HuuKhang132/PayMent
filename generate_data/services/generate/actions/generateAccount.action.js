const { MoleculerError } = require("moleculer").Errors;
const { faker } = require("@faker-js/faker");
const MongoClient = require("mongodb").MongoClient;

module.exports = async function (ctx) {
	const client = new MongoClient(process.env.MONGO_URI_FE, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		keepAlive: true,
	});
	try {
		await client.connect();
		const accountModel = client.db("test").collection("account");
		const walletModel = client.db("test").collection("wallet");

		await accountModel.drop();
		await walletModel.drop();

		const payload = ctx.params.body;

		let accountList = [];
		let walletList = [];

		let previousAccountCreateTime = "2018-01-01T00:00:00.000Z";

		for (let i = 1; i < payload.quantity+1; i++) {
			if (i%1000 === 0) {
				console.log(i);
			}
			const fullName = faker.helpers.unique(faker.name.fullName, null, { maxRetries: 1000, maxTime: 1000 });
			const userName = fullName.replaceAll(" ", "_");
			const email = userName + "@gmail.com";
			const phone = faker.phone.number("0#########");
			// const phone = i.toString().padStart(10, '0')
			const gender = faker.name.sex().toUpperCase();
			const avatar = "google.com";
			const createAt = faker.date.future(0.000008, previousAccountCreateTime);

			const accountCreateInfo = {
				email: email,
				phone: phone,
				username: userName,
				password: "daylamatkhau",
				fullname: fullName,
				gender: gender,
				avatar: avatar,
				walletId: i,
				id: i,
				createAt: createAt,
				updatedAt: createAt,
			};
			accountList.push(accountCreateInfo);

			const walletCreateInfo = {
				userId: i,
				fullname: accountCreateInfo.fullname,
				balance: 0,
				id: i,
				createAt: createAt,
				updatedAt: createAt,
			};
			walletList.push(walletCreateInfo);

			previousAccountCreateTime = createAt;
		}

		await accountModel.insertMany(accountList);
		await walletModel.insertMany(walletList);
        
		return {
			code: 1000,
			message: "Thành công!",
		};

	} catch (err) {
		console.log(err);
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[Generate] Generate Account: ${err.message}`);
	}
};
