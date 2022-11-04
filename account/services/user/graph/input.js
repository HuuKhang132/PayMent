
const gql = require('moleculer-apollo-server').moleculerGql;

module.exports = gql`

input GetUserInfoInput {
  id: Int
}

input RegisterInput {
    email: String!,
    phone: String!,
    username: String!,
    password: String!,
    fullname: String!,
    gender: String!,
    avatar: String!
}

input SigninInput {
    username: String!,
    password: String!,
}

input UpdateInput {
    email: String!,
    phone: String!,
    fullname: String!,
    gender: String!,
    avatar: String!
}

input ForgotPasswordInput {
    username: String!,
    email: String!,
}

input ResetPasswordInput {
    newPassword: String!,
    reNewPassword: String!
}
`;
