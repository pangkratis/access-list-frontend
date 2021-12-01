import gql from 'graphql-tag'

export const getAvailableItems = gql`
  query items {
    items: getAvailableItems {
      id
      name
      group {
        id
        title
      }
    }
  }
`

export const getFilteredItems = gql`
  query items($page: Float, $limit: Float, $filter: String, $groupIds: [String!]) {
    items: getPaginateItems(page: $page, limit: $limit, filter: $filter, groupIds: $groupIds) {
      total
      data {
        id
        name
        available
        type
        group {
          id
          title
        }
        rentals {
          user {
            id
            fullname
          }
        }
      }
    }
  }
`

export const getAllAssetItems = gql`
  query assetItems {
    assetItems: getAssetItems {
      id
      user {
        id
        fullname
      }
      item {
        id
        name
      }
    }
  }
`

export const getItem = gql`
  query item($id: String!) {
    item: getItemById(id: $id) {
      id
      name
      type
      available
      rentals {
        id
        from
        to
        user {
          id
          fullname
          role
        }
      }
    }
  }
`
