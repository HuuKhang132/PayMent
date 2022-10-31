const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const moment = require('moment')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.body

        // let fromDate = payload.fromDate.toDate()
        // let toDate = payload.toDate.toDate()
        
        let listTransaction = await this.broker.call('v1.TransactionModel.aggregate', [
            [
                { 
                    $match: {
                        $and: [
                            {"$expr": { $ne: [ "$walletId", null ]}},
                            { walletId: { $gt: payload.fromWallet, $lte: payload.toWallet } },
                            { createAt: { $gte: payload.fromDate, $lte: payload.toDate } },
                        ]
                    },
                },
                {
                    $facet: {
                        totalTransaction: [
                            {
                                $group: { 
                                    _id: "$walletId",
                                    total: { $sum: 1}
                                },
                            },
                            { 
                                $sort : { _id: 1 } 
                            },
                        ],
                        totalSucceedTransaction: [
                            {
                                $match: {
                                    status: "SUCCEED" ,
                                },
                            },
                            {
                                $group: { 
                                    _id: "$walletId",
                                    total: { $sum: 1}
                                },
                            },
                            { 
                                $sort : { _id: 1 } 
                            },
                        ],
                        totalFailedTransaction: [
                            {
                                $match: {
                                    status: "FAILED" ,
                                },
                            },
                            {
                                $group: { 
                                    _id: "$walletId",
                                    total: { $sum: 1}
                                },
                            },
                            { 
                                $sort : { _id: 1 } 
                            },
                        ],                        
                    },
                },
            ]
		])

        listTransaction = listTransaction[0]

        let transactionInfoList = {}
        let finalList = []
		const listUser = await this.broker.call('v1.AccountModel.aggregate', [
            [
                {
                    $match: { walletId: { $gt: payload.fromWallet, $lte: payload.toWallet } }
                },
                {
                    $project: {
                        _id: 0,
                        userInfo: { $concat: [ "$fullname", " - ",  { $toString: "$id" }, " - ", "$email" ] },
                        walletId: 1
                    }
                },
            ]
        ])

        for (let i = 0; i < listTransaction.totalTransaction.length; i++) {
            transactionInfoList[`${listTransaction.totalTransaction[i]._id}`] = {
                totalTransaction: listTransaction.totalTransaction[i].total,
                totalSucceedTransaction: 0,
                totalFailedTransaction: 0,
            }
        }

        for (let i = 0; i < listTransaction.totalSucceedTransaction.length; i++) {
            transactionInfoList[`${listTransaction.totalSucceedTransaction[i]._id}`].totalSucceedTransaction = listTransaction.totalSucceedTransaction[i].total
        }

        for (let i = 0; i < listTransaction.totalFailedTransaction.length; i++) {
            transactionInfoList[`${listTransaction.totalFailedTransaction[i]._id}`].totalFailedTransaction = listTransaction.totalFailedTransaction[i].total
        }

        for (let i = 0; i < listUser.length; i++) {
            if ( transactionInfoList[`${listUser[i].walletId}`] ) {
                let transationUserInfo = listUser[i].userInfo + " - "
                                        + transactionInfoList[`${listUser[i].walletId}`].totalTransaction + " - "
                                        + transactionInfoList[`${listUser[i].walletId}`].totalSucceedTransaction + " - "
                                        + transactionInfoList[`${listUser[i].walletId}`].totalFailedTransaction
                finalList.push(transationUserInfo)
            }
        }

       

		return {
			code: 1000,
			message: this.__("succeed"),
            data: {
                list: finalList,
            },
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Get: ${err.message}`);
	}
};
