import gql from 'graphql-tag'

export const createGroup = gql`
  mutation createGroup($data: GroupDataInput!) {
    createGroup(data: $data) {
      id
      title
      color
      manager {
        id
        fullname
      }
    }
  }
`

export const updateGroup = gql`
  mutation updateGroup($id: String!, $data: GroupDataInput!) {
    updateGroup(id: $id, data: $data) {
      id
      title
      color
      manager {
        id
        fullname
      }
    }
  }
`

export const deleteGroup = gql`
  mutation deleteGroup($id: String!) {
    deleteGroup(id: $id)
  }
`
