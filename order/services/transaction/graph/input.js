
const gql = require('moleculer-apollo-server').moleculerGql;

module.exports = gql`

input TransactionGetListInput {
  walletId: Int
}

input StatisticTransactionByDateInput {
    from: String!,
    to: String!,
    type: String
}

input StatisticTransactionByAccountInput {
    from: String!,
    to: String!,
    accountId: Int
}

#===============================================MUTATION===============================================

input TopUpInput {
    amount: Int!,
    supplier: String!
}

input TransferInput {
    destWalletId: Int!
    amount: Int!
}

input WithdrawInput {
    supplier: String!
    amount: Int!
}

input VerifyTransactionInput {
    otp: Int!
    transactionId: Int!
}

input IpnWithdrawInput {
    transactionId: Int!
    status: String!
    supplierTransactionId: String!
}
`;
