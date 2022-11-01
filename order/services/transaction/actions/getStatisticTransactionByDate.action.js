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

        let getType = ['TRANSFER', 'TOPUP', 'WITHDRAW']
        if ( payload.type ) {
            getType = [payload.type]
        }
        console.log(getType)


        // let listTransaction = await this.broker.call('v1.TransactionModel.aggregate', [
        //     [
        //         { 
        //             $match: {
        //                 $and: [
        //                     { createAt: { $gt: from, $lt: to } },
        //                     {"$expr": {"$in": ["$type", getType]}}
        //                 ]
        //             },
        //         },
        //         { 
        //             $addFields: {
        //                 date: { $dateToString: { format: "%d/%m/%Y", date: "$createAt" } },
        //                 sortDate: { $dateToString: { format: "%Y-%m-%d", date: "$createAt" } }
        //             }
        //         },
        //         {
        //             $facet: {
        //                 totalTransaction: [
        //                     {
        //                         $group: { 
        //                             _id: {
        //                                 date: "$date",
        //                                 sortDate: "$sortDate",
        //                             },
        //                             total: { $sum: 1}
        //                         },
        //                     },
        //                     { 
        //                         $addFields: {
        //                             sortDate: { $toDate: "$_id.sortDate" }
        //                         }
        //                     },
        //                     { 
        //                         $sort : { sortDate: 1 } 
        //                     },
        //                     {
        //                         $project: {
        //                             _id: 0,
        //                             date: "$_id.date",
        //                             total: "$total",
        //                         }
        //                     }
        //                 ],
        //                 totalSucceedTransaction: [
        //                     {
        //                         $match: {
        //                             status: "SUCCEED",
        //                         },
        //                     },
        //                     {
        //                         $group: { 
        //                             _id: {
        //                                 date: "$date",
        //                                 sortDate: "$sortDate",
        //                             },
        //                             total: { $sum: 1}
        //                         },
        //                     },
        //                     { 
        //                         $addFields: {
        //                             sortDate: { $toDate: "$_id.sortDate" }
        //                         }
        //                     },
        //                     { 
        //                         $sort : { sortDate: 1 } 
        //                     },
        //                     {
        //                         $project: {
        //                             _id: 0,
        //                             date: "$_id.date",
        //                             total: "$total",
        //                         }
        //                     }
        //                 ],
        //                 totalFailedTransaction: [
        //                     {
        //                         $match: {
        //                             status: "FAILED",
        //                         },
        //                     },
        //                     {
        //                         $group: { 
        //                             _id: {
        //                                 date: "$date",
        //                                 sortDate: "$sortDate",
        //                             },
        //                             total: { $sum: 1}
        //                         },
        //                     },
        //                     { 
        //                         $addFields: {
        //                             sortDate: { $toDate: "$_id.sortDate" }
        //                         }
        //                     },
        //                     { 
        //                         $sort : { sortDate: 1 } 
        //                     },
        //                     {
        //                         $project: {
        //                             _id: 0,
        //                             date: "$_id.date",
        //                             total: "$total",
        //                         }
        //                     }
        //                 ]
        //             }
        //         },
        //     ]
		// ])

        let listTransaction = await this.broker.call('v1.TransactionModel.aggregate', [
            [
                { 
                    $match: {
                        $and: [
                            { createAt: { $gt: from, $lt: to } },
                            {"$expr": {"$in": ["$type", getType]}}
                        ]
                    },
                },
                { 
                    $addFields: {
                        date: { $dateToString: { format: "%d/%m/%Y", date: "$createAt" } },
                        sortDate: { $dateToString: { format: "%Y-%m-%d", date: "$createAt" } }
                    }
                },
                {
                    $group: { 
                        _id: {
                            sortDate: "$sortDate",
                            status: "$status"
                        },
                        count: { $sum: 1}
                    },
                },
                { 
                    $addFields: {
                        sortDate: { $toDate: "$_id.sortDate" }
                    }
                },
                { 
                    $sort : { sortDate: 1 } 
                },
                {
                    $project: {
                        _id: 0,
                        date: { $dateToString: { format: "%d/%m/%Y", date: "$sortDate" } },
                        status: "$_id.status",
                        count: "$count",
                    }
                },
            ]
		])

        let transactionInfoList = {} 

        for (let transaction of listTransaction) {
            let date = transaction.date
            if ( !transactionInfoList[`${date}`] ) {
                transactionInfoList[`${date}`] = {
                    date: date,
                    totalTransaction: 0,
                    totalSucceedTransaction: 0,
                    totalFailedTransaction: 0,
                }
            } 
            switch (transaction.status) {
                case "SUCCEED": 
                    transactionInfoList[`${date}`].totalSucceedTransaction = transaction.count
                    break;
                case "FAILED":
                    transactionInfoList[`${date}`].totalFailedTransaction = transaction.count
                    break;
            }
            transactionInfoList[`${date}`].totalTransaction = transactionInfoList[`${date}`].totalSucceedTransaction + transactionInfoList[`${date}`].totalFailedTransaction
        }

        let finalList = Object.values(transactionInfoList)

        // const workSheetColumnNames = [
        //     "Date",
        //     "Total Transaction",
        //     "Total Succeed Transaction",
        //     "Total Failed Transaction",
        // ]

        // const workSheetName = "Transaction_Group_Date"

        // const filePath = `../exports/Transaction_Date.xlsx`;

        // const exportsList = ( finalList, workSheetColumnNames, workSheetName, filePath ) => {
        //     const data = finalList.map( item => {
        //         let splitItem = item.split(" - ")
        //         return [splitItem[0], splitItem[1], splitItem[2], splitItem[3]]
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
