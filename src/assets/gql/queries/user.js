import gql from 'graphql-tag'

export const getUser = gql`
  query user($id: String!) {
    user: getUserById(id: $id) {
      id
      fullname
      role
      rentals {
        id
        from
        to
        item {
          id
          name
        }
      }
    }
  }
`

export const getAllMembers = gql`
  query users {
    users: getAllUsers {
      id
      fullname
      role
      endEmploymentAt
      groupsManager {
        id
        title
      }
      department {
        id
        name
      }
    }
  }
`

export const getFilteredMembers = gql`
  query getAllUsers($page: Float, $limit: Float, $filter: String, $flag: Float) {
    users: getPaginateUsers(page: $page, limit: $limit, filter: $filter, flag: $flag) {
      total
      data {
        id
        fullname
        email
        hiredAt
        endEmploymentAt
        role
        department{
          id
          name
        }
        supervisor
        groupsManager {
          id
          title
        }
        rentals {
          id
          item {
            id
            name
          }
        }
      }
    }
  }
`

export const currentUser = gql`
  query currentUser {
    currentUser: getUserByEmail {
      id
      fullname
      email
      role
      groupsManager{
        id
        title
      }
      department{
        id
      }
      supervisor
    }
  }
`
export const UsersWithNoDepartment = gql`
  query UsersWithNoDepartment {
    UsersWithNoDepartment: UsersWithNoDepartment {
      id
      fullname
      email
      role
      groupsManager{
        id
        title
      }
      department{
        id
      }
      supervisor
    }
  }
`
