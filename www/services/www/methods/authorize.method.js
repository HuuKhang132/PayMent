const _ = require('lodash');

module.exports = async function (ctx, route, req) {
	ctx.meta.auth = ctx.meta.user;
	console.log("ctx.meta.auth   ", ctx.meta.auth)
	delete ctx.meta.user;
};
