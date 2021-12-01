import gql from 'graphql-tag'

export const createUser = gql`
  mutation createUser($data: UserDataInput!) {
    createUser(data: $data) {
      id
      fullname
      email
      hiredAt
      endEmploymentAt
      department {
        id
      }
      supervisor
      role
    }
  }
`

export const updateUser = gql`
  mutation updateUser($id: String!, $data: UserDataInput!) {
    updateUser(id: $id, data: $data) {
      id
      fullname
      email
      hiredAt
      endEmploymentAt
      department {
        id
      }
      supervisor
      role
    }
  }
`
