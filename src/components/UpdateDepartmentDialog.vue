<template>
  <div>
    <q-dialog v-model="updateDialog">
      <q-layout view="Lhh lpR fff" style="height: 550px; border-radius: 30px" container class="bg-white">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title>Update Department</q-toolbar-title>
          </q-toolbar>
        </q-header>
        <q-footer class="text-white row justify-between">
          <div class="q-gutter-md q-pa-sm">
            <q-btn v-if="loggedUser.role === 'Admin'" rounded flat label="Delete Department" text-color="red-4" @click="deleteDpepartmentBtn(departmentId)"/>
          </div>
          <div class="q-gutter-md q-pa-sm">
            <q-btn flat rounded label="Cancel" v-close-popup @click="closeDialog()" />
            <q-btn flat rounded label="Update" class="text-white" color="primary" v-close-popup @click="updateDepartmentBtn()"/>
          </div>
        </q-footer>
        <q-page-container class="q-mt-lg">
          <div class="q-pa-sm" v-if="loggedUser.role ==='Admin' || loggedUser.role === 'StaffManager'">
            <q-input
              v-if="departmentsManagerSelect === loggedUser.fullname || loggedUser.role === 'Admin'"
              v-model="departmentName"
              rounded
              outlined
              color="secondary"
              clearable
              label="Department's Name"
            />
            <q-input
              v-else-if="departmentsManagerSelect !== loggedUser.fullname "
              readonly
              v-model="departmentName"
              rounded
              outlined
              color="secondary"
              clearable
              label="Department's Name"
            />
          </div>
          <div class="q-pa-sm" v-if="loggedUser.role ==='Admin' || loggedUser.role === 'StaffManager'">
            <div class="q-gutter-md">
              <div @click="clicked = true">
                <q-select
                  v-if="departmentsManagerSelect === loggedUser.fullname || loggedUser.role === 'Admin'"
                  rounded
                  outlined
                  use-input
                  clearable
                  input-debounce="0"
                  transition-show="scale"
                  transition-hide="scale"
                  behavior="menu"
                  color="secondary"
                  label="Supervisor"
                  v-model="departmentsManagerSelect"
                  @filter="searchMembers"
                  :options="departmentManagerOptions"
                  option-label="fullname"
                  option-value="id"
                  map-options
                  emit-value
                  >
                </q-select>
                <q-select
                  v-if="departmentsManagerSelect !== loggedUser.fullname && loggedUser.role !== 'Admin'"
                  readonly
                  rounded
                  outlined
                  use-input
                  clearable
                  input-debounce="0"
                  transition-show="scale"
                  transition-hide="scale"
                  behavior="menu"
                  color="secondary"
                  label="Supervisor"
                  v-model="departmentsManagerSelect"
                  @filter="searchMembers"
                  :options="departmentManagerOptions"
                  option-label="fullname"
                  option-value="id"
                  map-options
                  emit-value
                  >
                </q-select>
              </div>
            </div>
          </div>
          <div class="q-pa-sm q-pl-md bg-grey-3 q-mr-xl q-ml-sm q-my-md rounded-borders" style="border-radius: 40px">

            <h6 class="q-mb-none q-mt-sm text-primary text-body2">Department Members</h6>

            <div class="q-pt-sm q-pl-none q-ml-none q-mb-lg q-mt-none flex row">
              <q-btn v-if="loggedUser.role === 'Admin'" @click="AddMembersDialogRef.openAddMembersDialog(departmentId)" flat class="bg-white q-mr-sm q-mb-sm" style="border-radius: 40px">
                <span class="material-icons-outlined text-secondary">
                  person_add
                </span>
              </q-btn>

              <div v-for="(user,index) in departmentMembers" :key="user.id">
                <q-chip v-if="departmentsManagerSelect === loggedUser.fullname" color="white" text-color="primary" removable @remove="removeDepartmentMemberBtn(user.id,index)" icon="person">{{user.fullname}}</q-chip>
                <q-chip v-if="departmentsManagerSelect !== loggedUser.fullname" color="white" text-color="primary" icon="person">{{user.fullname}}</q-chip>

              </div>
            </div>

          </div>
        </q-page-container>

      </q-layout>
    </q-dialog>
    <AddMembersDialog ref="AddMembersDialogRef" @selectedMembersArray="selectMembers"/>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from '@vue/composition-api'
import { getAllMembers } from '../assets/gql/queries/user'
import { useQuery, useMutation } from '@vue/apollo-composable'
import { updateDepartment, deleteDepartment } from '../assets/gql/mutations/department'

import { clone } from 'ramda'

import AddMembersDialog from '../components/AddMembersDialog.vue'
import store from 'src/store'

import { Notify } from 'quasar'

export default defineComponent({
  components: {
    AddMembersDialog
  },
  setup (_, { emit }) {
    const loggedUser = computed(() => store.getters['user/getUser'])
    const updateDialog = ref(false)
    const AddMembersDialogRef = ref(null)
    const departmentName = ref(null)
    const departmentId = ref(null)
    const departmentsManagerId = ref(null)
    const departmentMembers = ref(null)
    const GiveDayOffDialogRef = ref(null)
    const departmentsMembers = ref([])
    const clicked = ref(false) // check if departments manager is changed
    const selectMembersValue = ref(null)
    const departmentManagerOptions = ref([])
    const departmentsManagerSelect = ref(null)

    const { result: getAllMembersResult } = useQuery(getAllMembers)

    const allUsers = computed(() => {
      return getAllMembersResult.value ? getAllMembersResult.value.users : []
    })

    // Search supervizors in select input
    const searchMembers = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        departmentManagerOptions.value = allUsers.value.filter(
          v => v.fullname.toLowerCase().indexOf(needle) > -1
        )
      })
    }

    const openUpdateDialog = (row) => {
      updateDialog.value = true
      departmentName.value = row.name
      departmentsManagerSelect.value = row.manager.fullname
      departmentsManagerId.value = row.manager.id
      departmentMembers.value = clone(row.members)
      departmentId.value = row.id
    }

    const { mutate: updateDepartmentMutation } = useMutation(updateDepartment)
    const updateDepartmentBtn = () => {
      console.log(clicked, departmentsManagerId, departmentsManagerSelect)
      updateDepartmentMutation({ id: departmentId.value, ownerId: clicked.value === true ? departmentsManagerSelect.value : departmentsManagerId.value, name: departmentName.value, membersId: departmentMembers.value.map(i => i.id) }).then(() => {
        selectMembersValue.value = null
        emit('fetchDepartments')
        if (loggedUser.value.role === 'Admin') {
          Notify.create({
            position: 'bottom-right',
            message: "Department's manager has been changed",
            color: 'secondary',
            type: 'positive'
          })
        }
      }).catch((error) => {
        Notify.create({
          position: 'bottom-right',
          message: error.message.split(':').pop(),
          color: 'negative',
          type: 'negative'
        })
      })
      updateDialog.value = false
    }

    const removeDepartmentMemberBtn = (id, index) => {
      departmentMembers.value.splice(index, 1)
    }

    const { mutate: deleteDepartmentMutation } = useMutation(deleteDepartment)
    const deleteDpepartmentBtn = (id) => {
      deleteDepartmentMutation({ id: id }).then(() => {
        fetchDepartments()
        Notify.create({
          position: 'bottom-right',
          message: 'Department has been removed',
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
      updateDialog.value = false
    }

    const closeDialog = () => {
      emit('fetchDepartments')
    }
    const fetchDepartments = () => {
      updateDialog.value = false
      emit('fetchDepartments')
    }

    const selectMembers = (value) => {
      selectMembersValue.value = value
      departmentMembers.value = departmentMembers.value.concat(allUsers.value.filter((i) => value.includes(i.id)))
    }
    return {
      openUpdateDialog,
      loggedUser,
      updateDialog,
      departmentName,
      searchMembers,
      departmentsManagerSelect,
      departmentManagerOptions,
      departmentMembers,
      updateDepartmentBtn,
      AddMembersDialogRef,
      departmentId,
      removeDepartmentMemberBtn,
      fetchDepartments,
      GiveDayOffDialogRef,
      selectMembers,
      departmentsMembers,
      closeDialog,
      clicked,
      deleteDpepartmentBtn,
      selectMembersValue
    }
  }
})
</script>

<style scoped>

</style>
