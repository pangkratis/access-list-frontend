import gql from 'graphql-tag'

export const addDepartmetMembers = gql`
  mutation addMembers($id: String!, $ids: [String!]!) {
    addMembers(id: $id, ids: $ids)
  }
`
export const removeDepartmentMembers = gql`
  mutation removeMembers($id: String!, $ids: [String!]!) {
    removeMembers(id: $id, ids: $ids)
  }
`
export const createDepartment = gql`
  mutation createDepartment($data: DepartmentInput!) {
    createDepartment(data: $data) {
     id
     name
     manager{
       id
     }
     members{
       id
     }
    }
  }
`
export const deleteDepartment = gql`
  mutation deleteDepartment($id: String!) {
    deleteDepartment(id: $id)
  }
`
// export const updateDepartment = gql`
//   mutation updateDepartment($id: String!, $newName: String!) {
//     updateDepartment(id: $id, newName: $newName)
//   }
// `
export const changeDepartmentManager = gql`
  mutation changeDepartmentManager($id: String!, $managerId: String!) {
    changeDepartmentManager(id: $id, managerId: $managerId)
  }
`
export const increseDays = gql`
  mutation increseDaysOff($id: String!, $days: Float!, $holiday: Boolean!) {
    increseDaysOff(id: $id, days: $days, holiday: $holiday )
  }
`
export const updateDepartment = gql`
  mutation updateDepartment($id: String!, $ownerId: String!, $name: String!, $membersId: [String!]!) {
    updateDepartment(id: $id, ownerId: $ownerId, name: $name, membersId: $membersId )
  }
`
