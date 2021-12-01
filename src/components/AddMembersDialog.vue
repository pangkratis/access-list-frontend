<template>
  <div>
    <q-dialog v-model="addMemberDialog">
      <q-layout view="Lhh lpR fff" style="height: 300px; width:400px; border-radius: 30px" container class="bg-white">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title>Add Members</q-toolbar-title>
          </q-toolbar>
        </q-header>
        <q-footer class="text-white row justify-end">
          <div class="q-gutter-md q-pa-sm">
            <q-btn rounded flat label="Cancel" v-close-popup />
            <q-btn rounded flat label="Add" @click="addDepartmentMembers()"/>
          </div>
        </q-footer>
        <q-page-container class="q-mt-xl">
          <div class="q-pa-sm">
              <div class="q-gutter-md row">
                <q-select rounded outlined v-model="userSelect" label="Members" :options="users" option-value="id" option-label="fullname" multiple map-options emit-value use-chips style="width: 100%"/>
              </div>
          </div>
        </q-page-container>
      </q-layout>
    </q-dialog>

  </div>
</template>

<script>
import { defineComponent, ref, computed, onUpdated } from '@vue/composition-api'

import { useQuery } from '@vue/apollo-composable'
import { UsersWithNoDepartment } from '../assets/gql/queries/user'

export default defineComponent({
  setup (_, { emit }) {
    const addMemberDialog = ref(false)
    const departmentId = ref(null)
    const userSelect = ref([]) // selected users

    const { result: getUsersResult, refetch: fetchUsers } = useQuery(UsersWithNoDepartment)

    const users = computed(() => {
      const arr = ref(null)
      arr.value = getUsersResult.value ? getUsersResult.value.UsersWithNoDepartment : []
      arr.value.map(i => userSelect.value.forEach(j => i.id !== j))
      console.log('Array: ', arr.value)
      return arr.value
    })

    onUpdated(() => {
      fetchUsers()
    })

    const openAddMembersDialog = (id) => {
      addMemberDialog.value = true
      departmentId.value = id
    }

    const addDepartmentMembers = () => {
      emit('selectedMembersArray', userSelect.value)
      addMemberDialog.value = false
    }
    return {
      openAddMembersDialog,
      addMemberDialog,
      users,
      userSelect,
      addDepartmentMembers
    }
  }
})
</script>

<style scoped>

</style>
