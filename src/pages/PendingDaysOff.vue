<template>
  <div>
    <div class="q-pa-md fixed-center">
      <q-table
        v-if="pendingDaysOff.length > 0"
        title="Treats"
        class="rounded-borders shadow-9"
        :data="pendingDaysOff"
        :columns="columns"
        :loading="loading"
        row-key="id"
        selection="multiple"
        :selected.sync="selected"
        flat
        style="border-radius: 30px"
      >
        <template v-slot:top>
          <!-- Approve pending day off button-->
          <q-btn rounded color="primary" @click="approveDayOffRequest()" flat >
            <q-icon class="material-icons">
              thumb_up
            </q-icon>
             <p class="q-mt-md q-ml-sm">Approve</p>
          </q-btn>

          <!-- Rejected pending day off button -->

          <!-- Disable button if selected more than one row -->
          <q-btn color="red-4" v-if="selected.length > 1" disable flat @click="prompt=true">
            <q-icon class="material-icons">
              thumb_down
            </q-icon>
             <p class="q-mt-md q-ml-sm">Reject</p>
          </q-btn>

          <!-- Enable button if one row is selected -->
          <q-btn rounded color="red-4" v-else-if="selected.length <= 1" flat @click="prompt=true">
            <q-icon class="material-icons">
              thumb_down
            </q-icon>
             <p class="q-mt-md q-ml-sm">Reject</p>
          </q-btn>

          <!-- Disable button if no item is selected -->
           <q-btn color="red-4" v-else disable flat @click="prompt=true">
            <q-icon class="material-icons">
              thumb_down
            </q-icon>
             <p class="q-mt-md q-ml-sm">Reject</p>
          </q-btn>
          <q-space />
        </template>
      </q-table>

       <!-- Display image and message if there is no table data -->
      <div v-if="pendingDaysOff.length === 0" class="flex row justify-center">
        <div>
        <h6  v-if="pendingDaysOff.length === 0" class="text-primary">No requests...</h6>
        </div>
        <div>
          <img src="../assets/Illustrations/undraw_scrum_board_re_wk7v.svg"/>
        </div>
      </div>
  </div>

  <!-- Rejecte reason dialog -->
   <q-dialog v-model="prompt">
      <q-card style="min-width: 350px; border-radius: 30px">
        <q-card-section>
          <div class="text-h6">Reject Reason</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense v-model="rejectReason" autofocus autogrow />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn rounded flat label="Cancel" v-close-popup />
          <q-btn rounded flat label="Submit" v-close-popup  @click="rejectReasonSubmit(selected)"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from '@vue/composition-api'
import { Notify } from 'quasar'

import { useMutation, useQuery } from '@vue/apollo-composable'
import { getPendingDaysOff, pendingExists } from 'src/assets/gql/queries/dayoff'
import { confirmDayOf, acceptDayOff } from '../assets/gql/mutations/dayoff'
import { acceptedExists } from '../assets/gql/queries/dayoff'

import { format } from 'date-fns'

import store from 'src/store'

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
  { name: 'reason', align: 'left', label: 'Reason', field: 'reason' },
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
  }
]

export default defineComponent({
  setup () {
    const selected = ref([]) // row selected checkbox
    const loggedUser = computed(() => store.getters['user/getUser'])
    const rejectReason = ref(null)

    // Get pending days off query
    const {
      result: pendingDaysOffResult,
      loading,
      refetch: refetchPendingDaysOff
    } = useQuery(getPendingDaysOff, { id: loggedUser.value.id })

    const pendingDaysOff = computed(() => {
      return pendingDaysOffResult.value ? pendingDaysOffResult.value.pendignDaysOff : []
    })
    onMounted(() => {
      refetchPendingDaysOff()
    })

    const { mutate: confirmDayOffMutation } = useMutation(confirmDayOf)
    const { mutate: acceptDayOffMutation } = useMutation(acceptDayOff)

    const { refetch: fetchAcceptedExists } = useQuery(acceptedExists)
    const { refetch: fetchPendingExists } = useQuery(pendingExists)

    // get an array of all selected days off
    const selectedComputed = computed(() => {
      if (selected.value === undefined) {
        return []
      } else {
        return selected.value.map(i => i.id)
      }
    })

    // Approve day off request
    const approveDayOffRequest = () => {
      acceptDayOffMutation({ ids: selectedComputed.value }).then(() => {
        selected.value = []
        refetchPendingDaysOff()
        fetchAcceptedExists()
        fetchPendingExists()
        Notify.create({
          position: 'bottom-right',
          message: 'Day(s) off approved',
          color: 'secondary',
          type: 'positive'
        })
      }).catch((error) => {
        Notify.create({
          position: 'bottom-right',
          message: error.message.split(':').pop(),
          color: 'negative',
          type: 'negative'
        })
      })
    }
    const rejectReasonSubmit = (select) => {
      confirmDayOffMutation({ id: select[0].id, accepted: false, reasonRejected: rejectReason.value }).then(() => {
        selected.value = []
        refetchPendingDaysOff()
        fetchPendingExists()
        rejectReason.value = ''
        Notify.create({
          position: 'bottom-right',
          message: 'Day(s) off rejected',
          color: 'secondary',
          type: 'positive'
        })
      }).catch((error) => {
        Notify.create({
          position: 'bottom-right',
          message: error.message.split(':').pop(),
          color: 'negative',
          type: 'negative'
        })
      })
    }
    return {
      selected,
      columns,
      pendingDaysOff,
      approveDayOffRequest,
      loading,
      prompt: ref(false),
      rejectReason,
      rejectReasonSubmit
    }
  }
})
</script>

<style scoped>

</style>
