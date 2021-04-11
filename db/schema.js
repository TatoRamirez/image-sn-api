const { gql, makeExecutableSchema } = require("apollo-server");

//Schema
const typeDefs = gql`
  #typeDef Usuarios
  type User {
    id: ID
    user: String
    image: String
    name: String
    lastname: String
    userdesc: String
    birthdate: String
    personalemail: String
    phone: String
    nationality: String
    password: String
    createdate: String
    modifieddate: String
    active: Boolean
    terms: Boolean
  }

  input UserInput {
    user: String
    image: String
    name: String
    lastname: String
    userdesc: String
    birthdate: String
    personalemail: String
    phone: String
    nationality: String
    password: String
    createdate: String
    modifieddate: String
    active: Boolean
    terms: Boolean
  }

  input AuthUserInput {
    personalemail: String!
    password: String!
  }

  type Token {
    token: String
  }

  #typeDef publi
  type publi {
    id: ID
    image: String
    description: String
    likes: Int
    createdate: String
    modifieddate: String
  }

  #typeDef Post
  type Post {
    id: ID
    iduser: String
    posts: [publi]
  }

  input PostInput {
    iduser: String
    image: String
    description: String
    likes: Int
    createdate: String
    modifieddate: String
  }

  #typeDef userlike
  type userlike {
    iduser: String
  }

  #typeDef Hearth
  type Hearth {
    idpost: String
    UsersLikes: [userlike]
  }

  input HearthInput {
    idpost: String
    iduser: String
  }

  #typeDef follow
  type follow {
    follow_iduser: String
  }

  #typeDef Follows
  type Follows {
    iduser: String
    follows: [follow]
  }

  input FollowsInput {
    iduser: String
    follow_iduser: String
  }

  #typeDef follower
  type follower {
    follower_iduser: String
  }

  #typeDef Followers
  type Followers {
    iduser: String
    followers: [follower]
  }

  input FollowersInput {
    iduser: String
    follower_iduser: String
  }

  type Query {
    getUser(input: UserInput): User
    allUserFollows(input: UserInput): [Follows]
    allUserFollowers(input: UserInput): [Followers]

    getPost(id: ID!): Post
    allUserPost(input: UserInput): [Post]

    getMyFollowers(input: FollowsInput): [Follows]
  }

  type Mutation {
    authUser(input: AuthUserInput): Token

    newUser(input: UserInput): Token
    updateUser(id: ID!, input: UserInput): User
    deleteUser(id: ID!): String

    newPost(input: PostInput): String
    updatePost(id: ID!, input: PostInput): Post
    deletePost(id: ID!): String

    newHearth(input: HearthInput): String
    deleteHearth(input: HearthInput): String

    newFollow(input: FollowsInput): String
    deleteFollow(input: FollowsInput): String
  }
`;

module.exports = typeDefs;
