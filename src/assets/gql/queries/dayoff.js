import gql from 'graphql-tag'

export const getRegisteredDaysOff = gql`
  query registeredDaysOff {
    registeredDaysOff: getRegisteredDaysOff {
      id
      user {
        id
        fullname
      }
      start: startDate
      end: endDate
      status
      title: reason
      rejectedReason
      holiday
      sickdays
    }
  }
`
export const getAcceptedDaysOff = gql`
  query acceptedDaysOff {
    acceptedDaysOff: getAcceptedDaysOff {
      id
      user {
        id
        fullname
      }
      start: startDate
      end: endDate
      status
      reason
      rejectedReason
      holiday
      sickdays
    }
  }
`
export const getUserDaysOff = gql`
  query userDaysOff {
    userDaysOff: getUserDaysOff {
      id
      user {
        id
        fullname
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
export const getDepartmentsDaysOff = gql`
  query departmentsDaysOff($id: String!) {
    departmentsDaysOff: getDepartmentsDaysOff(id: $id) {
      id
      user {
        id
        fullname
        department{
          id
          manager{
            id
            fullname
          }
        }
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
export const getPendingDaysOff = gql`
  query pendignDaysOff ($id: String!) {
    pendignDaysOff: getPendingDaysOff(id: $id) {
      id
      user {
        id
        fullname
      }
      start: startDate
      end: endDate
      status
      reason
      rejectedReason
      holiday
      sickdays
    }
  }
`
export const getPagDaysOff = gql`
  query getPagDaysOff ($id: String!, $ilimit: Float!, $page: Float!) {
    getPagDaysOff: getPagDaysOff(id: $id, ilimit: $ilimit, page: $page) {
      data {
        id
        user {
          id
          fullname
        }
        start: startDate
        end: endDate
        status
        reason
        rejectedReason
        holiday
        sickdays
      }
      total
    }
  }
`
export const getDepartmentPagDaysOff = gql`
  query getDepartmentPagDaysOff ($id: String!, $limit: Float!, $page: Float!) {
    getDepartmentPagDaysOff: getDepartmentPagDaysOff(id: $id, limit: $limit, page: $page) {
      data {
        id
        user {
          id
          fullname
        }
        start: startDate
        end: endDate
        status
        reason
        rejectedReason
        holiday
        sickdays
      }
      total
    }
  }
`
export const pendingExists = gql`
  query pendingExists {
    pendingExists: pendingExists
  }
`
export const acceptedExists = gql`
  query acceptedExists {
    acceptedExists: acceptedExists
  }
`
