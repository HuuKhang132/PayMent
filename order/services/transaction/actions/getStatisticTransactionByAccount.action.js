const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const moment = require('moment')
const XLSX = require('xlsx')
const path = require('path')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.query
        moment.locale('vi');
		let from = moment(payload.from, "DD/MM/YYYY").utc(true).toDate()
		let to = moment(payload.to, "DD/MM/YYYY").add(1, 'days').utc(true).toDate()


        let finalList = []

        if ( payload.accountId ) {
            let userId = parseInt(payload.accountId, 10)
            let user = await this.broker.call('v1.AccountModel.aggregate', [
                [
                    {
                        $match: { id: userId }
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
            user = user[0]
            if (_.get(user, 'userId', null) == null) {
                return {
                    code: 1001,
                    message: this.__("failed"),
                };
            }
            let userTransactionInfo = {
                ...user,
                totalTransaction: 0,
                totalSucceedTransaction: 0,
                totalFailedTransaction: 0,
            }

            let listTransaction = await this.broker.call('v1.TransactionModel.aggregate', [
                [
                    { 
                        $match: {
                            $and: [
                                { walletId: user.walletId },
                                { createAt: { $gte: from, $lte: to } },
                            ]
                        },
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

            for (let transaction of listTransaction) {
                switch (transaction.status) {
                    case "SUCCEED": 
                    userTransactionInfo.totalSucceedTransaction = transaction.count
                        break;
                    case "FAILED":
                        userTransactionInfo.totalFailedTransaction = transaction.count
                        break;
                }
                userTransactionInfo.totalTransaction = userTransactionInfo.totalSucceedTransaction + userTransactionInfo.totalFailedTransaction
            }

            finalList.push(userTransactionInfo)

        } else {
            let listTransaction = await this.broker.call('v1.TransactionModel.aggregate', [
                [
                    { 
                        $match: {
                            $and: [
                                {"$expr": { $ne: [ "$walletId", null ]}},
                                { createAt: { $gte: from, $lte: to } },
                            ]
                        },
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
                    { 
                        $sort : { walletId: 1 } 
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

        }
       
        console.log("finalList.length  ", finalList.length)

        // const workSheetColumnNames = [
        //     "Full Name",
        //     "User Id",
        //     "Email",
        //     "Total Transaction",
        //     "Total Succeed Transaction",
        //     "Total Failed Transaction",
        // ]

        // const workSheetName = "Transaction_Group_User"

        // const filePath = "../exports/Transaction_User.xlsx";

        // const exportsList = ( finalList, workSheetColumnNames, workSheetName, filePath ) => {
        //     const data = finalList.map( item => {
        //         let splitItem = item.split(" - ")
        //         return [splitItem[0], splitItem[1], splitItem[2], splitItem[3], splitItem[4], splitItem[5]]
        //     })
        //     const workBook = XLSX.utils.book_new()
        //     const workSheetData = [
        //         workSheetColumnNames,
        //         ...data
        //     ]
        //     const workSheet = XLSX.utils.aoa_to_sheet(workSheetData)
        //     XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName)
        //     XLSX.writeFile(workBook, path.resolve(filePath))
        //     return true

        // }

        // exportsList(finalList, workSheetColumnNames, workSheetName, filePath)

        return {
			code: 1000,
			message: this.__("succeed"),
            data: {
                from: from,
                to: to,
                totalRecords: finalList.length,
                list: finalList,
            },
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Get: ${err.message}`);
	}
};
