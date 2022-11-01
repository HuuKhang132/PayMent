const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const moment = require('moment')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.query
        moment.locale('vi');
		let from = moment(payload.from, "DD/MM/YYYY").utc(true).toDate()
		let to = moment(payload.to, "DD/MM/YYYY").add(1, 'days').utc(true).toDate()

        let finalList = []

        let matchQuery = {}
        if ( payload.accountId ) {
            let user = await this.broker.call('v1.AccountModel.findOne', [{ id: parseInt(payload.accountId, 10) }])
            if (_.get(user, 'id', null) == null) {
                return {
                    code: 1001,
                    message: this.__("failed"),
                };
            }

            matchQuery = {
                $and: [
                    { walletId: user.walletId },
                    { createAt: { $gte: from, $lte: to } },
                ]
            }
        } else {
            matchQuery = {
                $and: [
                    {"$expr": { $ne: [ "$walletId", null ]}},
                    { createAt: { $gte: from, $lte: to } },
                ]
            }
        }

        let listTransaction = await this.broker.call('v1.TransactionModel.aggregate', [
            [
                { 
                    $match: matchQuery,
                },
                {
                    $group: { 
                        _id: {
                            walletId: "$walletId",
                            status: "$status"
                        },
                        count: { $sum: 1}
                    },
                },
                {
                    $project: {
                        _id: 0,
                        walletId: "$_id.walletId",
                        status: "$_id.status",
                        count: "$count",
                    }
                },
            ]
        ])

        let transactionInfoList = {} 
    
        for (let transaction of listTransaction) {
            let walletId = transaction.walletId
            if ( !transactionInfoList[`${walletId}`] ) {
                transactionInfoList[`${walletId}`] = {
                    walletId: walletId,
                    totalTransaction: 0,
                    totalSucceedTransaction: 0,
                    totalFailedTransaction: 0,
                }
            } 
            switch (transaction.status) {
                case "SUCCEED": 
                    transactionInfoList[`${walletId}`].totalSucceedTransaction = transaction.count
                    break;
                case "FAILED":
                    transactionInfoList[`${walletId}`].totalFailedTransaction = transaction.count
                    break;
            }
            transactionInfoList[`${walletId}`].totalTransaction = transactionInfoList[`${walletId}`].totalSucceedTransaction + transactionInfoList[`${walletId}`].totalFailedTransaction
        }

        let listWalletId = Object.keys( transactionInfoList )
        listWalletId = listWalletId.map( walletId => parseInt(walletId, 10) )

        const listUser = await this.broker.call('v1.AccountModel.aggregate', [
            [
                {
                    $match: {"$expr": {"$in": ["$walletId", listWalletId]}} 
                },
                {
                    $project: {
                        _id: 0,
                        fullname: 1,
                        userId: "$id",
                        email: 1,
                        walletId: 1
                    }
                },
            ]
        ])

        for ( let user of listUser ) {
            if ( transactionInfoList[`${user.walletId}`] ) {
                transactionInfoList[`${user.walletId}`] = {
                    ...user,
                    ...transactionInfoList[`${user.walletId}`]
                }
            }
        }

        finalList = Object.values(transactionInfoList)
        finalList.sort((a, b) => b.totalSucceedTransaction - a.totalSucceedTransaction)
       
        return {
			code: 1000,
			message: this.__("succeed"),
            data: {
                from: payload.from,
                to: payload.to,
                totalRecords: finalList.length,
                list: finalList,
            },
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Get: ${err.message}`);
	}
};
