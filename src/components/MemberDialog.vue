<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="seen">
      <q-layout view="Lhh lpR fff" style="height: 790px; border-radius: 30px" container class="bg-white">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title class="text-center"> {{ mode }} Member </q-toolbar-title>
          </q-toolbar>
        </q-header>

        <q-footer class="text-white row justify-end">
          <div class="q-gutter-md q-pa-sm">
            <q-btn rounded flat label="Cancel" v-close-popup />
            <q-btn rounded color="secondary" label="Save" @click="submit" push />
          </div>
        </q-footer>

        <q-page-container>
          <q-page padding>
            <div class="q-pa-sm">
              <q-input
                outlined
                rounded
                color="secondary"
                v-model="fullname"
                clearable
                label="FullName"
                ref="nameInput"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Fullname is required.']"
              />
            </div>
            <div class="q-pa-sm">
              <q-input outlined rounded color="secondary" v-model="email" label="Email" clearable />
            </div>
            <div class="q-pa-sm" style="max-width: 300px">
              <q-input
                outlined
                rounded
                clearable
                v-model="hiredAt"
                color="secondary"
                label="Hired Date"
                ref="hiredDateInput"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Hired Date is required.']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date minimal v-model="hiredAt" today-btn mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="q-pa-sm" style="max-width: 300px">
              <q-input
                outlined
                rounded
                color="secondary"
                label="End Employment Date"
                clearable
                v-model="endEmploymentAt"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date minimal v-model="endEmploymentAt" today-btn mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="dark" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="q-pa-sm">
              <q-select
                outlined
                rounded
                clearable
                v-model="department"
                use-input
                hide-selected
                fill-input
                transition-show="scale"
                transition-hide="scale"
                input-debounce="0"
                :options="departmentsArray"
                option-label="name"
                option-value="id"
                @new-value="addNewDepartment"
                label="Department"
                @filter="searchDepartment"
                ref="departmentInput"
                lazy-rules
                emit-value
                map-options
                :rules="[val => (val && val.length > 0) || 'Department is required.']"
              >
              </q-select>
            </div>
            <div class="q-pa-sm q-mb-lg">
              <q-select
                outlined
                rounded
                use-input
                hide-selected
                fill-input
                map-options
                emit-value
                clearable
                input-debounce="0"
                transition-show="scale"
                transition-hide="scale"
                behavior="menu"
                color="secondary"
                label="Supervisor"
                :options="filteringMembers"
                option-label="fullname"
                option-value="id"
                options-selected-class="text-info"
                v-model="supervisor"
                @filter="searchMembers"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No Supervisor found
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.fullname }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.role }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="q-pa-sm">
              <q-select
                :disable="loggedUser.role !== 'Admin'"
                outlined
                rounded
                map-options
                clearable
                emit-value
                transition-show="scale"
                transition-hide="scale"
                color="secondary"
                v-model="role"
                :options="RoleOptions"
                label="Role"
                options-selected-class="text-info"
                ref="roleInput"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Role is required.']"
              />
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script>
// Vue and Quasar
import { Notify } from 'quasar'
import store from 'src/store'
import { defineComponent, ref, watch, computed, reactive } from '@vue/composition-api'
// Apollo
import { useMutation, useQuery } from '@vue/apollo-composable'
// Queries / Mutations
import { createUser, updateUser } from 'src/assets/gql/mutations/user'
import { getAllMembers } from 'src/assets/gql/queries/user'
import { getDepartments } from 'src/assets/gql/queries/department'

// Libraries
import { format } from 'date-fns'
import { formatDateToISO } from 'src/assets/helpers/formatdate'

export default defineComponent({
  name: 'MemberDialog',
  setup (_, { emit }) {
    // Input Validations Refs
    const nameInput = ref(null)
    const emailInput = ref(null)
    const departmentInput = ref(null)
    const hiredDateInput = ref(null)
    const roleInput = ref(null)

    const fullname = ref(null)
    const email = ref(null)
    const hiredAt = ref(null)
    const endEmploymentAt = ref(null)
    const department = ref(null)
    const supervisor = ref(null)
    const role = ref(null)
    const memberRow = ref(null)
    const filteringMembers = ref([])
    const seen = ref(false)
    const RoleOptions = reactive(['Admin', 'User', 'StaffManager'])

    // Get Current User from State
    const loggedUser = computed(() => store.getters['user/getUser'])

    // Watch input fields everytime when the Dialog is closed or open
    watch(seen, seenValue => {
      if (!memberRow.value && loggedUser.value !== 'Admin') {
        role.value = 'User'
      }
      if (!seenValue) {
        fullname.value = null
        email.value = null
        hiredAt.value = null
        endEmploymentAt.value = null
        department.value = null
        supervisor.value = null
        role.value = null
        memberRow.value = null
      }
    })

    const { result: getDepartmentsResult } = useQuery(getDepartments)
    const departmentsArray = computed(() => {
      return getDepartmentsResult.value ? getDepartmentsResult.value.departments : []
    })
    const departments = departmentsArray.value

    // Add & Edit Dialog Mode
    const mode = computed(() => {
      return memberRow.value ? 'Edit' : 'Add'
    })

    // Open Dialog
    const open = (payload = false) => {
      if (payload !== false) {
        fullname.value = payload.fullname
        email.value = payload.email
        hiredAt.value = payload.hiredAt
          ? format(new Date(payload.hiredAt), 'dd-MM-yyyy')
          : format(new Date(payload.hiredAt), 'dd-MM-yyyy')
        endEmploymentAt.value = payload.endEmploymentAt
          ? format(new Date(payload.endEmploymentAt), 'dd-MM-yyyy')
          : payload.endEmploymentAt
        department.value = payload.department ? payload.department.id : ''
        supervisor.value = payload.supervisor
        role.value = payload.role
        memberRow.value = payload
      }
      filteringMembers.value = members.value
      seen.value = true
    }

    // Create Member Mutation
    const { mutate: createMemberMutation } = useMutation(createUser, () => ({
      variables: {
        data: {
          email: email.value,
          fullname: fullname.value,
          hiredAt: hiredAt.value,
          endEmploymentAt: endEmploymentAt.value,
          department: department.value,
          supervisor: supervisor.value,
          role: role.value
        }
      }
    }))

    // Update Member Mutation
    const { mutate: updateMemberMutation } = useMutation(updateUser, () => ({
      variables: {
        id: memberRow.value.id,
        data: {
          email: email.value,
          fullname: fullname.value,
          hiredAt: hiredAt.value,
          endEmploymentAt: endEmploymentAt.value,
          department: department.value,
          supervisor: supervisor.value,
          role: role.value
        }
      }
    }))

    // Form submition
    const submit = () => {
      // validate input
      const n = nameInput.value.validate()
      const d = departmentInput.value.validate()
      const h = hiredDateInput.value.validate()
      const r = roleInput.value.validate()

      if (!n || !d || !h || !r) {
        return false
      } else {
        if (mode.value === 'Add') {
          if (email.value === '' || endEmploymentAt.value === '') {
            email.value = null
            endEmploymentAt.value = null
          }

          hiredAt.value = formatDateToISO(hiredAt.value)

          if (endEmploymentAt.value !== null) {
            endEmploymentAt.value = formatDateToISO(endEmploymentAt.value)
          }
          createMemberMutation()
            .then(() => {
              emit('refetchMembers')
              emit('refetchSupers')
              seen.value = false
              Notify.create({
                position: 'bottom-right',
                message: 'New Member added',
                color: 'secondary',
                type: 'positive'
              })
            })
            .catch(error => {
              console.log(error)
              Notify.create({
                position: 'bottom-right',
                message: error.message.split(':').pop(),
                color: 'negative',
                type: 'negative'
              })
            })
        } else if (mode.value === 'Edit') {
          hiredAt.value = formatDateToISO(hiredAt.value)

          if (endEmploymentAt.value !== null) {
            endEmploymentAt.value = formatDateToISO(endEmploymentAt.value)
          }
          updateMemberMutation()
            .then(() => {
              emit('refetchMembers')
              emit('refetchSupers')
              seen.value = false
              Notify.create({
                position: 'bottom-right',
                message: 'Member updated',
                color: 'secondary',
                type: 'positive'
              })
            })
            .catch(error => {
              Notify.create({
                position: 'bottom-right',
                message: error.message.split(':').pop(),
                color: 'negative',
                type: 'negative'
              })
            })
        }
      }
    }

    // Get All Users from GraphQL
    const { result } = useQuery(getAllMembers)
    const members = computed(() => (result.value ? result.value.users : []))

    watch(members, () => {
      filteringMembers.value = members.value.filter(
        m => m.endEmploymentAt <= new Date(Date.now()) || m.endEmploymentAt === null
      )
    })

    // Search Departments in select input
    const searchDepartment = (val, update) => {
      update(() => {
        if (val === '') {
          departments.value = departmentsArray.value.map(i => i.id)
        } else {
          const needle = val.toLowerCase()
          departments.value = departments.filter(v => v.toLowerCase().indexOf(needle) > -1)
        }
      })
    }

    // Addimg the new Department to the department options list
    const addNewDepartment = (val, done) => {
      if (val.length > 0) {
        if (!departments.includes(val)) {
          departments.push(val)
        }
        done(val, 'toggle')
      }
    }

    // Search supervizors in select input
    const searchMembers = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        filteringMembers.value = members.value.filter(
          v => v.fullname.toLowerCase().indexOf(needle) > -1
        )
      })
    }

    return {
      fullname,
      email,
      hiredAt,
      endEmploymentAt,
      departments,
      department,
      supervisor,
      role,
      loggedUser,
      memberRow,
      seen,
      RoleOptions,
      mode,
      open,
      submit,
      nameInput,
      emailInput,
      departmentInput,
      hiredDateInput,
      roleInput,
      searchDepartment,
      filteringMembers,
      searchMembers,
      addNewDepartment,
      departmentsArray
    }
  }
})
</script>
