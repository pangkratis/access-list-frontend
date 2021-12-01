import gql from 'graphql-tag'

export const createItem = gql`
  mutation createItem($data: ItemDataInput!) {
    createItem(data: $data) {
      id
      name
      available
      type
      rentals {
        id
        from
        user {
          id
          fullname
        }
      }
      group {
        id
        title
      }
    }
  }
`

export const updateItem = gql`
  mutation updateItem($id: String!, $data: ItemDataInput!) {
    updateItem(id: $id, data: $data) {
      id
      name
      available
      type
      rentals {
        id
        from
        user {
          id
          fullname
        }
      }
      group {
        id
        title
      }
    }
  }
`

export const deleteItem = gql`
  mutation deleteItem($id: String!) {
    deleteItem(id: $id)
  }
`
