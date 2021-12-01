<template>
  <div>
    <div class="q-pa-md fixed-center">
      <q-table
        v-if="acceptedDaysOff.length > 0"
        class="rounded-borders shadow-9"
        :data="acceptedDaysOff"
        :columns="columns"
        :loading="loading"
        row-key="id"
         selection="multiple"
        :selected.sync="selected"
        style="width: 1000px; max-height: 500px; border-radius: 30px"
        flat
      >
        <template v-slot:top>
          <q-btn color="secondary" label="Registered" @click="registerDayOffButton()" />
          <q-space />
        </template>
      </q-table>

      <!-- Display image and message if there is no table data -->
      <div v-if="acceptedDaysOff.length === 0" class="flex row justify-center">
        <div>
        <h6  v-if="acceptedDaysOff.length === 0" class="text-primary">Nothing to register...</h6>
        </div>
        <div>
          <img src="../assets/Illustrations/undraw_good_team_re_j1kc.svg" style="width:800px"/>
        </div>
      </div>
  </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from '@vue/composition-api'
import { Notify } from 'quasar'
import { getAcceptedDaysOff, getRegisteredDaysOff } from 'src/assets/gql/queries/dayoff'
import { registerDaysOff } from 'src/assets/gql/mutations/dayoff'
import { acceptedExists } from '../assets/gql/queries/dayoff'

import store from 'src/store'

import { useQuery, useMutation, useResult } from '@vue/apollo-composable'
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
    }// Show holiday or sickday in one column
  }
]

export default defineComponent({
  setup () {
    const loggedUser = computed(() => store.getters['user/getUser']) // Get logged user

    const selected = ref([]) // selected table row

    // Get pending days off query
    const {
      result: accepetedDaysOffResult,
      loading,
      refetch: refetchAcceptedDaysOff
    } = useQuery(getAcceptedDaysOff)
    const acceptedDaysOff = computed(() => {
      return accepetedDaysOffResult.value ? accepetedDaysOffResult.value.acceptedDaysOff : []
    })
    onMounted(() => {
      refetchAcceptedDaysOff()
    })

    const { refetch: refetchAcceptedExists } = useQuery(acceptedExists) // refetch accepted days off to show icon badge notification

    const { mutate: registerDayOffMutation } = useMutation(registerDaysOff)
    const {
      result: registeredDaysOffResult,
      refetch: refetchRegisteredDayOff
    } = useQuery(getRegisteredDaysOff)
    const registered = useResult(registeredDaysOffResult, []) // idk

    const selectedComputed = computed(() => {
      if (selected.value === undefined) {
        return []
      } else {
        return selected.value.map(i => i.id)
      }
    })

    // Register selected accepted days off request
    const registerDayOffButton = () => {
      registerDayOffMutation({ ids: selectedComputed.value }).then(() => {
        refetchAcceptedDaysOff()
        refetchAcceptedExists()
        refetchRegisteredDayOff()
        selected.value = []
        Notify.create({
          position: 'bottom-right',
          message: 'Day(s) off registered',
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
      registered,
      columns,
      acceptedDaysOff,
      loading,
      registerDayOffButton,
      loggedUser
    }
  }
})
</script>

<style scoped>

</style>
