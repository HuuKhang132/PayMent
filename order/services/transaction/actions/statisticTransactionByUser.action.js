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
            const user = await this.broker.call('v1.AccountModel.findOne', [{ id: payload.accountId }])
            if (_.get(user, 'id', null) == null) {
                return {
                    code: 1001,
                    message: this.__("failed"),
                };
            }
            let getTransaction = await this.broker.call('v1.Transaction.getTransactionByAccountId', {
                body: {
                    fromDate: from,
					toDate: to,
					walletId: user.walletId
                }
            })
            finalList = finalList.concat(getTransaction.data.list)
        } else {
            const lastWalletId = await this.broker.call('v1.AccountModel.aggregate', [
                [
                    { $sort: { _id: -1 } },
                    { $limit: 1 },
                    { $project: { walletId: 1 } }
                ]
            ])
            console.log("lastWalletId  ", lastWalletId[0].walletId)
    
            
            let fromWallet = 0
            let toWallet = fromWallet + 100000
    
            while ( toWallet <= lastWalletId[0].walletId + 100000 ) {
                let getTransaction = await this.broker.call('v1.Transaction.getTransactionGroupByAccount', {
                    body: {
                        fromDate: from,
                        toDate: to,
                        fromWallet: fromWallet,
                        toWallet: toWallet,
                    }
                })
                console.log("toWallet  ", toWallet)
                finalList = finalList.concat(getTransaction.data.list)
    
                fromWallet = toWallet
                toWallet = fromWallet + 100000
    
            }
        }
       
        console.log("finalList.length  ", finalList.length)

        const workSheetColumnNames = [
            "Full Name",
            "User Id",
            "Email",
            "Total Transaction",
            "Total Succeed Transaction",
            "Total Failed Transaction",
        ]

        const workSheetName = "Transaction_Group_User"

        const filePath = "../exports/Transaction_User.xlsx";

        const exportsList = ( finalList, workSheetColumnNames, workSheetName, filePath ) => {
            const data = finalList.map( item => {
                let splitItem = item.split(" - ")
                return [splitItem[0], splitItem[1], splitItem[2], splitItem[3], splitItem[4], splitItem[5]]
            })
            const workBook = XLSX.utils.book_new()
            const workSheetData = [
                workSheetColumnNames,
                ...data
            ]
            const workSheet = XLSX.utils.aoa_to_sheet(workSheetData)
            XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName)
            XLSX.writeFile(workBook, path.resolve(filePath))
            return true

        }

        exportsList(finalList, workSheetColumnNames, workSheetName, filePath)

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
