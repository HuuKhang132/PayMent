const gql = require('moleculer-apollo-server').moleculerGql;

module.exports = gql`

type AccountQuery {
    "Lấy thông tin tài khoản"
    GetUserInfo(input: GetUserInfoInput): UserInfoResponsed
}

type UserInfoResponsed {
    code: Int
    message: String
    data: User
}

type User {
    id: Int
    fullname: String
    email: String
    phone: String
    username: String
    gender: String
    avatar: String
}

#=====================================================MUTATION========================================================

type AccountMutation {
    "Đăng ký"
    Register(input: RegisterInput): Responsed

    "Đăng nhập"
    Signin(input: SigninInput): SigninResponsed
    
    "Đăng xuất"
    Signout: Responsed

    "Cập nhật thông tin tài khoản"
    Update(input: UpdateInput): UserInfoResponsed

    "Quên mật khẩu"
    ForgotPassword(input: ForgotPasswordInput): Responsed

    "Đặt lại mật khẩu"
    ResetPassword(input: ResetPasswordInput): Responsed
}

type Responsed {
    code: Int
    message: String
} 

type SigninResponsed {
    code: Int
    message: String
    data: SigninData
}

type SigninData {
    accessToken: String
}
`;