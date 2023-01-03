const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const XLSX = require('xlsx')
const path = require('path')
const uuid = require('uuid')

module.exports = async function (ctx) {
	try {
        const user = ctx.meta.auth.credentials
        await this.broker.call('v1.Admin.adminAuth', {...user}) //authorization

		const payload = ctx.params.input

        const getStatistic = await this.broker.call('v1.Transaction.getStatisticTransactionByAccount', {
            body: {
                from: payload.from,
                to: payload.to,
                accountId: payload.accountId ? payload.accountId : null
            }
        })

        if ( getStatistic.code === 1001 ){
            return {
                code: 1001,
                message: this.__("failed"),
            };
        }

        let finalList = getStatistic?.data?.list ? getStatistic.data.list : []
       
        const workSheetColumnNames = [
            "Full Name",
            "User Id",
            "Email",
            "Total Transaction",
            "Total Succeed Transaction",
            "Total Failed Transaction",
        ]

        const fileName = "Transaction_User_" + uuid.v4()

        const workSheetName = "Transaction_Group_User"

        const filePath = `../exports/${fileName}.xlsx`;

        const exportsList = ( finalList, workSheetColumnNames, workSheetName, filePath ) => {
            const data = finalList.map( item => {
                return [item.fullname, item.userId, item.email, item.totalTransaction, item.totalSucceedTransaction, item.totalFailedTransaction]
            })
            const workBook = XLSX.utils.book_new()
            const workSheetData = [
                workSheetColumnNames,
                ...data
            ]
            const workSheet = XLSX.utils.aoa_to_sheet(workSheetData)

            let wscols = [
                { width: 25 },
                { width: 12 },
                { width: 40 },
                { width: 25 },
                { width: 25 },
                { width: 25 }, 
              ];
          
            workSheet["!cols"] = wscols;
            
            XLSX.utils.book_append_sheet(workBook, workSheet, workSheetName)
            XLSX.writeFile(workBook, path.resolve(filePath))
            return true
        }

        exportsList(finalList, workSheetColumnNames, workSheetName, filePath)

        const downloadUrl = process.env.DOWNLOAD_PATH + '/v1/Transaction/DownloadFile/' + fileName

        return {
			code: 1000,
			message: this.__("succeed"),
            data: downloadUrl
		};

	} catch (err) {
		if (err.name === 'MoleculerError') throw err;
		throw new MoleculerError(`[Transaction] Get: ${err.message}`);
	}
};
