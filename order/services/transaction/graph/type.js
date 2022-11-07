const gql = require('moleculer-apollo-server').moleculerGql;

module.exports = gql`

type TransactionQuery {
    "Thống kê Transaction theo ngày"
    GetStatisticTransactionByDate(input: StatisticTransactionByDateInput): StatisticTransactionByDateResponsed

    "Thống kê Transaction theo tài khoản"
    GetStatisticTransactionByAccount(input: StatisticTransactionByAccountInput): StatisticTransactionByAccountResponsed
}

type StatisticTransactionByDateResponsed {
    code: Int
    message: String
    data: [StatisticByDate]
}

type StatisticByDate {
    date: String
    totalTransaction: Int
    totalSucceedTransaction: Int
    totalFailedTransaction: Int
}

type StatisticTransactionByAccountResponsed {
    code: Int
    message: String
    data: [StatisticByAccount]
}

type StatisticByAccount {
    fullname: String
    userId: Int
    email: String
    totalTransaction: Int
    totalSucceedTransaction: Int
    totalFailedTransaction: Int
}

#=====================================================MUTATION========================================================

type TransactionMutation {
    "Nạp tiền vào Ví"
    TopUp(input: TopUpInput): TopUpResponsed

    "Chuyển tiền Ví -> Ví "
    Transfer(input: TransferInput): MoneyTransferResponsed

    "Rút tiền Ví -> Ngân Hàng"
    Withdraw(input: WithdrawInput): MoneyTransferResponsed

    "Xác thực Giao dịch"
    VerifyTransaction(input: VerifyTransactionInput): VerifyTransactionResponsed

    "Ngân hàng IPN xác nhận giao dịch"
    IpnWithdraw(input: IpnWithdrawInput): IpnWithdrawResponsed

    "Export Excel Thống kê Transaction theo ngày"
    ExportStatisticTransactionByDate(input: StatisticTransactionByDateInput): StatisticTransactionByDateResponsed

    "Export Excel Thống kê Transaction theo tài khoản"
    ExportStatisticTransactionByAccount(input: StatisticTransactionByAccountInput): StatisticTransactionByAccountResponsed
}

type TopUpResponsed {
    code: Int
    message: String
} 

type IpnWithdrawResponsed {
    code: Int
    message: String
}

type MoneyTransferResponsed {
    code: Int
    message: String
    data: TransactionOtpData
}

type VerifyTransactionResponsed {
    code: Int
    message: String
    data: TransactionData
}

type TransactionOtpData {
    transaction: Transaction
    otp: Int
}

type TransactionData {
    transaction: Transaction
}

type Transaction {
    id: Int
    walletId: Int
    destWalletId: Int
    status: String
    order: Order
    total: Int
    type: String
    supplierTransactionId: String
    supplier: String
}
`;