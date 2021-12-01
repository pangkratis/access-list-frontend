<template>
  <div>
     <div class="q-pa-md fixed-center" >
      <q-table
        title="Department's Days Off History"
        :data="pagDaysOff.data"
        :columns="columns"
        :pagination.sync="pagination"
        @request="onRequest"
        row-key="name"
        class="rounded-borders shadow-9"
        style="width: 1000px; max-height: 500px; border-radius: 30px"
      >

          <!-- Day off status column -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-icon v-if="props.row.status === 'Pending'" class="material-icons text-yellow-7"  size="sm">
                done
                <q-tooltip>
                  pending
                </q-tooltip>
              </q-icon>
              <q-icon v-if="props.row.status === 'Registered'" class="material-icons text-green-6" size="sm">
                done_all
                <q-tooltip>
                  registered
                </q-tooltip>
              </q-icon>
              <q-icon v-if="props.row.status === 'Rejected'" class="material-icons text-red-7"  size="sm">
                thumb_down_off_alt
                <q-tooltip>
                  rejected
                </q-tooltip>
              </q-icon>
            </q-td>
          </template>
      </q-table>

    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'

import { useQuery } from '@vue/apollo-composable'
import { getDepartmentPagDaysOff } from '../assets/gql/queries/dayoff'

import { format } from 'date-fns'

const columns = [
  {
    name: 'user',
    required: true,
    align: 'left',
    label: 'User',
    field: row => row.user.fullname,
    format: val => `${val}`,
    sortable: true
  },
  { name: 'startDate', align: 'left', label: 'Start Date', field: row => { return format(new Date(row.start), 'dd-MM-yyyy') }, sortable: true },
  { name: 'endDate', align: 'left', label: 'End Date', field: row => { return format(new Date(row.end), 'dd-MM-yyyy') } },
  { name: 'status', align: 'left', label: 'status', field: row => { return row.status } },
  { name: 'reason', align: 'left', label: 'Reason', field: row => { return row.reason } },
  { name: 'rejectedReason', align: 'left', label: 'Rejected Reason', field: row => { return row.rejectedReason } },
  {
    name: 'holiday',
    align: 'left',
    label: 'Days',
    field: row => {
      if (row.holiday !== 0) {
        return `${row.holiday} holidays`
      } else { return `${row.sickdays} sickdays` }
    }
  }]

export default defineComponent({
  setup (_, { root }) {
    const pagination = ref({
      page: 1,
      rowsPerPage: 7,
      rowsNumber: 10
    })

    // Arrows button in paginated table
    const onRequest = payload => {
      pagination.value.page = payload.pagination.page
      pagination.value.rowsPerPage = payload.pagination.rowsPerPage
    }

    // calculate pagination variables
    const variables = computed(() => {
      return {
        id: root.$route.params.id,
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage
      }
    })

    const { result: getDepartmentPagDaysOffResult, onResult } = useQuery(getDepartmentPagDaysOff, variables)
    onResult(() => {
      pagination.value.rowsNumber = getDepartmentPagDaysOffResult.value.getDepartmentPagDaysOff.total
    })
    const pagDaysOff = computed(() => {
      return getDepartmentPagDaysOffResult.value ? getDepartmentPagDaysOffResult.value.getDepartmentPagDaysOff : []
    })

    return {
      pagDaysOff,
      columns,
      variables,
      onRequest,
      pagination
    }
  }
})
</script>
