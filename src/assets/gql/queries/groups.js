import gql from 'graphql-tag'

export const getAllGroups = gql`
  query groups {
    groups: getAllGroups {
      id
      title
      color
      manager {
        id
        email
        fullname
        role
      }
      items {
        id
        name
        available
        type
      }
    }
  }
`
