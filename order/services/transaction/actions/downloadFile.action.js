const _ = require("lodash");
const { MoleculerError } = require("moleculer").Errors;
const fs = require("fs");

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.params;

		ctx.meta.$responseType = "application/x-www-form-urlencoded";
		ctx.meta.$responseHeaders = {
			"Content-Disposition": `attachment; filename=${payload.fileName}.xlsx`,
		};

		const filePath = `../exports/${payload.fileName}.xlsx`;

		let readStream = fs.createReadStream(filePath);
		return readStream;

	} catch (err) {
		if (err.name === "MoleculerError") throw err;
		throw new MoleculerError(`[Transaction] Download File: ${err.message}`);
	}
};
