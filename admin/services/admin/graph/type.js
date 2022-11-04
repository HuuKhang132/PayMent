const gql = require('moleculer-apollo-server').moleculerGql;

module.exports = gql`

#=====================================================MUTATION========================================================

type AdminMutation {
    "Đăng ký"
    Register(input: RegisterInput): Responsed

    "Đăng nhập"
    Signin(input: SigninInput): SigninResponsed
    
    "Đăng xuất"
    Signout: Responsed
}
`;