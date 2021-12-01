import gql from 'graphql-tag'

export const getDepartments = gql`
  query getDepartments {
    departments: getDepartments {
      id
      name
      manager{
        id
        fullname
      }
      members {
        id
        fullname
      }
    }
  }
`
export const getDepartment = gql`
  query getDepartment($id: String!) {
    departments: getDepartment(id: $id) {
      id
      name
      manager{
        id
        fullname
      }
      members {
        id
        fullname
      }
    }
  }
`
