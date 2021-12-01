import gql from 'graphql-tag'

export const requestDaysOff = gql`
  mutation requestDaysOff($id: String!, $data: DaysOffInput!, $isHoliday: Boolean!) {
    requestDaysOff(id: $id, data: $data, isHoliday: $isHoliday) {
      id
      user{
        id
      }
      startDate
      endDate
      status
      reason
      rejectedReason
      holiday
      sickdays
    }
  }
`
export const confirmDayOf = gql`
  mutation confirmDayOf($id: String!, $accepted: Boolean!, $reasonRejected: String!) {
    confirmDayOf(id: $id, accepted: $accepted, reasonRejected: $reasonRejected) {
      id
      user{
        id
      }
      startDate
      endDate
      status
      reason
      rejectedReason
      holiday
      sickdays
    }
  }
`
export const registerDaysOff = gql`
  mutation registerDaysOff($ids: [String!]!) {
    registerDaysOff(ids: $ids) {
      id
      user{
        id
      }
      startDate
      endDate
      status
      reason
      rejectedReason
      holiday
      sickdays
    }
  }
`
export const acceptDayOff = gql`
  mutation acceptDayOff($ids: [String!]!) {
    acceptDayOff(ids: $ids) {
      id
      user{
        id
      }
      startDate
      endDate
      status
      reason
      rejectedReason
      holiday
      sickdays
    }
  }
`
