import gql from 'graphql-tag'

export const getOpenRents = gql`
  query openRentals {
    openRentals: getOpenRents {
      id
      user {
        id
        fullname
      }
      item {
        id
        name
        type
        group {
          id
          title
          manager {
            id
          }
        }
      }
      comment
      from
      to
    }
  }
`

export const getClosedRents = gql`
  query getClosedRentals {
    getClosedRentals: getCloseRents {
      id
      user {
        id
        fullname
      }
      item {
        id
        name
        type
        group {
          id
          title
          manager {
            id
          }
        }
      }
      comment
      from
      to
    }
  }
`
