
const gql = require('moleculer-apollo-server').moleculerGql;

module.exports = gql`

input GetAllOrderInput {
  page: Int,
  limit: Int,
}

input GetOrderInput {
    id: Int!,
}

#===============================================MUTATION===============================================

input CreateOrderInput {
    total: Int,
    description: String,
    note: String,
    paymentMethod: String,
    providerId: Int
}

input PayOrderInput {
    orderId: Int!
}

input NapasInput {
    orderId: Int,
    transactionId: Int,
    supplierTransactionId: String,
    status: String
}
`;
