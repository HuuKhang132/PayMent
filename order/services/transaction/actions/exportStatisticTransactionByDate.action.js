const _ = require('lodash');
const { MoleculerError } = require('moleculer').Errors;
const moment = require('moment')
const XLSX = require('xlsx')
const path = require('path')

module.exports = async function (ctx) {
	try {
		const payload = ctx.params.query

        const getStatistic = await this.broker.call('v1.Transaction.getStatisticTransactionByDate', {
            query: {
                from: payload.from,
                to: payload.to,
                type: payload.type ? payload.type : null
            }
        })

        let finalList = getStatistic.data.list

        const workSheetColumnNames = [
            "Date",
            "Total Transaction",
            "Total Succeed Transaction",
            "Total Failed Transaction",
        ]

        const workSheetName = "Transaction_Group_Date"

        const filePath = `../exports/Transaction_Date.xlsx`;

        const exportsList = ( finalList, workSheetColumnNames, workSheetName, filePath ) => {
            const data = finalList.map( item => {
                return [item.date, item.totalTransaction, item.totalSucceedTransaction, item.totalFailedTransaction]
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
