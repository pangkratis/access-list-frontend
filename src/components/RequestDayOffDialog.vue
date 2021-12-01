<template>
  <div>
     <q-dialog v-model="alert">
      <q-layout view="Lhh lpR fff" style="height: 550px; border-radius: 30px" container class="bg-white borders-rounded">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title>Request Day Off</q-toolbar-title>
          </q-toolbar>
        </q-header>

        <q-footer class="text-white row justify-end">
          <div class="q-gutter-md q-pa-sm">
            <q-btn flat rounded label="Cancel" v-close-popup />
            <q-btn rounded color="secondary" label="Submit" @click="requestDayoff(requestDayoffDate)" />
          </div>
        </q-footer>

        <q-page-container>
          <q-page padding>
            <!-- Day off Reason Input -->
            <div class="q-pa-sm">
              <q-input
                outlined
                color="secondary"
                rounded
                clearable
                v-model="dayoffReason"
                label="Reason"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Reason is required.']"
              />
            </div>
            <div class="q-pa-sm q-mr-lg flex row justify-between">

              <!-- Date Picker -->
              <q-date clas="col-1" flat v-model="requestDayoffDate" mask="YYYY-MM-DD" range minimal/>
              <div class="q-pa-sm col-3">

              <!-- Is Holiday Toggle Button -->
                <div class="q-gutter-md row items-start bg-grey-3 rounded-borders" style="width: 150px; border-radius: 30px">
                  <p class="text-body2 text-weight-bold">Is it a holiday?</p>
                  <q-btn-toggle
                    rounded
                    class="q-mb-md q-mr-xl q-mt-none"
                    v-model="isHoliday"
                    toggle-color="primary"
                    :options="[
                      {label: 'Yes', value: true },
                      {label: 'No', value: false },
                    ]"
                  />
                </div>
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed } from '@vue/composition-api'

import { useMutation, useQuery } from '@vue/apollo-composable'
import { requestDaysOff } from '../assets/gql/mutations/dayoff'
import { pendingExists } from '../assets/gql/queries/dayoff'

import store from 'src/store'

import { Notify } from 'quasar'

import { format } from 'date-fns'

export default defineComponent({
  setup () {
    const loggedUser = computed(() => store.getters['user/getUser']) // Get logged user
    const alert = ref(false)
    const dayoffReason = ref('')
    const isHoliday = ref(true)
    const beforeDay = ref(null) // one day before the end day off day
    const requestDayoffDate = ref({ from: '', to: '' }) // Request day off date for datepicker
    const startDay = ref(null)
    const endDay = ref(null)

    const openRequestDayOffDialog = () => {
      alert.value = true
    }

    const selectRequestDayOffDialog = (value) => {
      alert.value = true
      startDay.value = new Date(value.startStr ? value.startStr : value.dateStr)
      endDay.value = new Date(value.endStr ? value.endStr : value.dateStr)
      if (value.startStr !== value.endStr) {
        beforeDay.value = new Date(endDay.value.getFullYear(), endDay.value.getMonth(), endDay.value.getDate() - 1)
      }
      if (value.endStr) {
        requestDayoffDate.value = { from: format(new Date(startDay.value), 'yyyy-MM-dd'), to: format(new Date(beforeDay.value), 'yyyy-MM-dd') }
      } else {
        requestDayoffDate.value = value.dateStr
      }
    }

    const { refetch: refetchPendingExists } = useQuery(pendingExists)

    // Function to add a request day off to db
    const { mutate: requestDayoffResult } = useMutation(requestDaysOff)
    const requestDayoff = (requestDayoffDate) => {
      const days = { startDate: (requestDayoffDate.from ? requestDayoffDate.from : requestDayoffDate), endDate: (requestDayoffDate.to ? requestDayoffDate.to : requestDayoffDate), reason: dayoffReason.value }
      requestDayoffResult({ id: loggedUser.value.id, data: days, isHoliday: isHoliday.value }).then(() => {
        refetchPendingExists()
        Notify.create({
          position: 'bottom-right',
          message: 'Day off is requested',
          color: 'secondary',
          type: 'positive'
        })
        requestDayoffDate = null
        dayoffReason.value = ''
        alert.value = false
      }).catch((error) => {
        Notify.create({
          position: 'bottom-right',
          message: error.message.split(':')[1],
          color: 'negative',
          type: 'negative'
        })
      })
      requestDayoffDate = null
      dayoffReason.value = ''
      alert.value = false
    }
    return {
      openRequestDayOffDialog,
      requestDayoffDate,
      isHoliday,
      dayoffReason,
      alert,
      requestDayoff,
      selectRequestDayOffDialog
    }
  }
})
</script>

<style scoped>

</style>
