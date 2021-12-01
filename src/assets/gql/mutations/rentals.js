import gql from 'graphql-tag'

export const createRental = gql`
  mutation createRental($data: RentalDataInput!) {
    createRental(data: $data) {
      id
      user {
        id
        fullname
      }
      item {
        id
        name
      }
      comment
      from
      to
    }
  }
`

export const updateRental = gql`
  mutation updateRental($id: String, $data: RentalDataInput!) {
    updateRental(id: $id, data: $data) {
      id
      user {
        id
        fullname
      }
      item {
        id
        name
      }
      comment
      from
      to
    }
  }
`

export const returnRental = gql`
  mutation returnRental($id: String!, $data: DateInput!) {
    returnRental(id: $id, data: $data) {
      id
      from
      to
    }
  }
`
