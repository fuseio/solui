import gql from 'graphql-tag'

/**
 * Get GraphQL type definitions.
 *
 * @return {GraphQLTypeDef}
 */
export const getTypeDefs = () => gql`
  scalar DateTime
  scalar JSON
  scalar EthereumAddress

  type User {
    id: ID!
    address: EthereumAddress!
  }

  type Release {
    id: ID!
    publisher: User!
    cid: String!
    title: String!
    description: String!
    production: Boolean!
    created: DateTime!
    bytecodeHashes: [String]!
  }

  type ReleaseList {
    releases: [Release]!
    page: Int!
    totalResults: Int!
    numPages: Int!
  }

  type PublishFinalize {
    finalizeUrl: String!
  }

  type PublishSuccess {
    cid: String!
    url: String!
    shortUrl: String!
  }

  type PublishToChainSuccess {
    dappId: String!
  }

  type ErrorDetails {
    code: String
    message: String
  }

  type Error {
    error: ErrorDetails
  }

  input PagingInput {
    page: Int
    resultsPerPage: Int
  }

  input PublishInput {
    spec: JSON!
    artifacts: JSON!
  }

  input PublishToChainInput {
    cid: String!
    bytecodeHashes: [String!]!
  }

  type AuthToken {
    token: String!
    expires: DateTime!
  }

  type DappChainInfo {
    exists: Boolean!
    numContracts: Int
    publisher: EthereumAddress
    date: DateTime
  }

  union PublishResult = PublishSuccess | PublishFinalize | Error
  union PublishToChainResult = PublishToChainSuccess | Error
  union ProfileResult = User | Error
  union LoginResult = AuthToken | Error
  union ReleaseResult = Release | Error
  union ReleaseListResult = ReleaseList | Error
  union AuthTokenResult = AuthToken | Error
  union DappChainInfoResult = DappChainInfo | Error

  type Query {
    getAllReleases(paging: PagingInput!): ReleaseListResult!
    getMyReleases(paging: PagingInput!): ReleaseListResult!
    getRelease(id: ID!): ReleaseResult!
    getAuthToken(loginToken: String!): AuthTokenResult!
    getMyProfile: ProfileResult!
    getDappInfoFromChain(dappId: String!): DappChainInfoResult!
  }

  type Mutation {
    publish(bundle: PublishInput!): PublishResult!
    publishToChain(bundle: PublishToChainInput!): PublishToChainResult!
    login(challenge: String!, signature: String!, loginToken: String): LoginResult!
  }
`

export const getFragmentMatcherConfig = () => ({
  __schema: {
    types: [
      {
        kind: 'UNION',
        name: 'ProfileResult',
        possibleTypes: [
          {
            name: 'User'
          },
          {
            name: 'Error'
          },
        ]
      },
      {
        kind: 'UNION',
        name: 'PublishResult',
        possibleTypes: [
          {
            name: 'PublishFinalize'
          },
          {
            name: 'PublishSuccess'
          },
          {
            name: 'Error'
          },
        ]
      },
      {
        kind: 'UNION',
        name: 'PublishToChainResult',
        possibleTypes: [
          {
            name: 'PublishToChainSuccess'
          },
          {
            name: 'Error'
          },
        ]
      },
      {
        kind: 'UNION',
        name: 'LoginResult',
        possibleTypes: [
          {
            name: 'AuthToken'
          },
          {
            name: 'Error'
          },
        ]
      },
      {
        kind: 'UNION',
        name: 'ReleaseResult',
        possibleTypes: [
          {
            name: 'Release'
          },
          {
            name: 'Error'
          },
        ]
      },
      {
        kind: 'UNION',
        name: 'ReleaseListResult',
        possibleTypes: [
          {
            name: 'ReleaseList'
          },
          {
            name: 'Error'
          },
        ]
      },
      {
        kind: 'UNION',
        name: 'AuthTokenResult',
        possibleTypes: [
          {
            name: 'AuthToken'
          },
          {
            name: 'Error'
          },
        ]
      },
      {
        kind: 'UNION',
        name: 'DappChainInfoResult',
        possibleTypes: [
          {
            name: 'DappChainInfo'
          },
          {
            name: 'Error'
          },
        ]
      },
    ]
  }
})
