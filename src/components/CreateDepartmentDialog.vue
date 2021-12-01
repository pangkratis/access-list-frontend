<template>
  <div>
    <q-dialog v-model="alert">
      <q-layout view="Lhh lpR fff" style="height: 350px; border-radius: 30px" container class="bg-white borders-rounded">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title>Create Deparment</q-toolbar-title>
          </q-toolbar>
        </q-header>
        <q-footer class="text-white row justify-end">
          <div class="q-gutter-md q-pa-sm">
            <q-btn flat label="Cancel" rounded v-close-popup />
            <q-btn flat label="Create" rounded color="white" v-close-popup @click="createDepartmentBtn()"/>
          </div>
        </q-footer>
        <q-page-container class="q-mt-xl">

          <!-- Departments Name Input -->
          <div class="q-pa-sm">
            <q-input
              outlined
              rounded
              clearable
              color="secondary"
              v-model="departmentsName"
              label="Department's Name"/>
          </div>

          <!-- Departments manager select -->
          <div class="q-pa-sm">
            <q-select
              v-model="departmentsManager"
              rounded
              :options="options"
              label="Department's Manager"
              emit-value
              map-options
              outlined
              color="secondary"
              style="width: 100%"
            />
          </div>
        </q-page-container>
      </q-layout>

    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watchEffect } from '@vue/composition-api'

import { Notify } from 'quasar'

import { useMutation, useQuery } from '@vue/apollo-composable'
import { createDepartment } from '../assets/gql/mutations/department'
import { getAllMembers } from '../assets/gql/queries/user'

export default defineComponent({
  setup (_, { emit }) {
    const departmentsName = ref('')
    const departmentsManager = ref(null)
    const alert = ref(false)
    const options = [] // departments manager options

    const { result: getUsersResult } = useQuery(getAllMembers)
    const usersResult = computed(() => {
      return getUsersResult.value ? getUsersResult.value.users : []
    })

    const openCreateDialog = () => {
      alert.value = true
    }
    watchEffect(() => {
      usersResult.value.forEach(i => options.push({ label: i.fullname, value: i.id }))
    })

    const { mutate: createDepartmentMutation } = useMutation(createDepartment)

    // Create Department
    const createDepartmentBtn = () => {
      console.log(getUsersResult.value.users.id)
      createDepartmentMutation({ data: { name: departmentsName.value, manager: departmentsManager.value } }).then(() => {
        emit('fetchDepartments')
        departmentsName.value = ''
        departmentsManager.value = null
        Notify.create({
          position: 'bottom-right',
          message: 'Department has been created',
          color: 'secondary',
          type: 'positive'
        })
      }).catch((error) => {
        departmentsName.value = ''
        departmentsManager.value = null
        Notify.create({
          position: 'bottom-right',
          message: error.message.split(':').pop(),
          color: 'negative',
          type: 'negative'
        })
      })
    }
    return {
      alert,
      createDepartmentBtn,
      departmentsName,
      departmentsManager,
      options,
      openCreateDialog
    }
  }
})
</script>

<style scoped>

</style>
