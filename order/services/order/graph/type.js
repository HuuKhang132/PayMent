const gql = require('moleculer-apollo-server').moleculerGql;

module.exports = gql`

type OrderQuery {
    "Thống kê Transaction theo ngày"
    GetAllOrder(input: GetAllOrderInput): GetAllOrderResponsed

    "Thống kê Transaction theo tài khoản"
    GetOrder(input: GetOrderInput): GetOrderResponsed
}

type GetAllOrderResponsed {
    code: Int
    message: String
    data: ListOrderData
}

type GetOrderResponsed{
    code: Int
    message: String
    data: Order
}

type ListOrderData {
    listOrder: [Order]
}

type Order{
    id: Int
    user: User,
    total: Int,
	description: String,
	note: String,
	paymentStatus: String,
	paymentMethod: String,
	providerId: Int,
}

#=====================================================MUTATION========================================================

type OrderMutation {
    "Tạo Đơn hàng"
    CreateOrder(input: CreateOrderInput): CreateOrderResponsed
    "Thanh toán Đơn hàng"
    PayOrder(input: PayOrderInput): MoneyTransferResponsed
    "Thanh toán Đơn hàng"
    Napas(input: NapasInput): Responsed
}

type CreateOrderResponsed {
    code: Int
    message: String
    data: CreateOrderResponseData
} 

type CreateOrderResponseData {
    url: String
    order: Order
    transaction: Transaction
    otp: Int
}
`;