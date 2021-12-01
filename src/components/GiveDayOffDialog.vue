<template>
  <div>
    <q-dialog v-model="giveDayOffDialog">
      <q-layout view="Lhh lpR fff" style="height: 350px; width:400px; border-radius: 30px" container class="bg-white">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title>Give Day Off</q-toolbar-title>
          </q-toolbar>
        </q-header>
        <q-footer class="text-white row justify-end">
          <div class="q-gutter-md q-pa-sm">
            <q-btn rounded flat label="Cancel" v-close-popup />
            <q-btn rounded flat label="Give" @click="giveDayOff()"/>
          </div>
        </q-footer>
        <q-page-container class="q-mt-xl">
          <div class="q-pa-sm">
                <q-input
                  v-model="givenDaysOff"
                  rounded
                  outlined
                  color="secondary"
                  clearable
                  label="Number of days"
                  :rules="[val => (val && /^[1-9]\d*$/.test(val)) || 'Field must be a positive number']"
                />
          </div>
          <div class="q-pa-md">
            <q-btn-toggle
              v-model="holidayToggle"
              toggle-color="primary"
              :options="[
                {label: 'Holiday', value: true},
                {label: 'Sick Day', value: false},
              ]"
            />
          </div>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api'

import { useMutation } from '@vue/apollo-composable'
import { increseDays } from 'src/assets/gql/mutations/department'
import { Notify } from 'quasar'

export default defineComponent({
  setup () {
    const giveDayOffDialog = ref(false)
    const givenDaysOff = ref(null)
    const department = ref(null)
    const holidayToggle = ref(true)

    const openGiveDayOffDialog = (id) => {
      giveDayOffDialog.value = true
      department.value = id
    }

    const { mutate: increseDaysMutation } = useMutation(increseDays)
    const giveDayOff = () => {
      increseDaysMutation({ id: department.value, days: parseInt(givenDaysOff.value), holiday: holidayToggle.value }).then(() => {
        givenDaysOff.value = ''
        Notify.create({
          position: 'bottom-right',
          message: "Department's days off has been increased.",
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
      giveDayOffDialog.value = false
    }
    return {
      openGiveDayOffDialog,
      giveDayOffDialog,
      givenDaysOff,
      giveDayOff,
      holidayToggle
    }
  }
})
</script>

<style scoped>

</style>
