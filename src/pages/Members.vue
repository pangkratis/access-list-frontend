<template>
  <q-page class="animate__animated animate__fadeInDown">

    <div class="fixed-center" style="width: 1100px; height: 500px;">
      <q-table
        title="members"
        class="rounded-borders shadow-9"
        :data="paginateMembers"
        :columns="columns"
        :loading="loading"
        :filter="search"
        :pagination.sync="pagination"
        @request="onRequest"
        row-key="name"
        flat
        style="border-radius: 30px"
      >
        <!-- Search input -->
        <template v-slot:top-right>

          <q-input
            class="q-pa-sm"
            color="secondary"
            outlined
            dense
            clearable
            debounce="120"
            v-model="search"
            placeholder="Search..."
          >
            <template v-slot:append>
              <q-icon class="q-mt-sm text-secondary" name="search" />
            </template>
          </q-input>
          <div>
            <q-tooltip>
              filter members
            </q-tooltip>
            <q-btn-dropdown
              color="secondary"
              class="q-pa-xs"
              dropdown-icon="filter_list"
              flat
              push
            >
              <div class="q-pa-sm">
                <q-option-group :options="radioOptions" type="radio" v-model="radioValue" size="xs"/>
              </div>
            </q-btn-dropdown>
          </div>
          <!-- Add Button -->
          <div class="column justify-center">
            <q-btn
              :disable="loggedUser.role !== 'Admin'"
              color="secondary"
              icon="data_saver_on"
              class="btn"
              @click="DialogRef.open()"
              push
              flat
            >
            <q-tooltip>
              create new member
            </q-tooltip>
            </q-btn>
          </div>
        </template>

        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th
              v-for="col in props.cols"
              :key="col.name"
              :props="props"
              class="text-green-10"
            >
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <!-- Actions Column -->
        <template v-slot:body-cell-tableActions="props">
          <q-td :props="props">
            <q-btn color="secondary" icon="settings" flat>
              <q-menu transition-show="flip-right" transition-hide="flip-left">
                <q-list dense>
                  <q-item
                    clickable
                    v-if="loggedUser.role === 'Admin' || loggedUser.role === 'StaffManager'"
                  >
                    <q-item-section @click="DialogRef.open(props.row)"> Edit </q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-if="
                      !props.row.endEmploymentAt &&
                        (loggedUser.role === 'Admin' || loggedUser.groupsManager.length !== 0)
                    "
                  >
                    <q-item-section @click="RentalDialogRef.open({ user: { id: props.row.id } })">
                      Rent item
                    </q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section @click="$router.replace(`/member/${props.row.id}`)">
                      Rental History
                    </q-item-section>
                  </q-item>
                  <q-item clickable>
                    <q-item-section @click="$router.replace(`/member/daysoff/${props.row.id}`)">
                      Days Off History
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>
      <MemberDialog
        ref="DialogRef"
        @refetchMembers="refetchMembers"
        @refetchSupers="refetchSupers"
      />
      <RentDialog ref="RentalDialogRef" @refetchMembers="refetchMembers" />
    </div>
  </q-page>
</template>

<script>
// Vue
import { computed, defineComponent, ref } from '@vue/composition-api'
import store from 'src/store'
// Apollo
import { useQuery } from '@vue/apollo-composable'
// Queries - Mutatons
import { getAllMembers, getFilteredMembers } from 'src/assets/gql/queries/user'
// Components
import MemberDialog from 'src/components/MemberDialog.vue'
import RentDialog from 'src/components/RentDialog.vue'
// Libraries
import lodash from 'lodash'
import { format } from 'date-fns'

export default defineComponent({
  name: 'Members',
  components: {
    MemberDialog,
    RentDialog
  },
  setup () {
    // References
    const DialogRef = ref(null)
    const RentalDialogRef = ref(null)
    // Pagination
    const pagination = ref({
      page: 1,
      rowsPerPage: 7,
      rowsNumber: 10
    })

    const search = ref('')
    const radioValue = ref(2)
    const radioOptions = ref([
      { label: 'all', value: 2, color: 'primary' },
      { label: 'active', value: 0, color: 'info' },
      { label: 'fired', value: 1, color: 'negative' }
    ])
    // Columns Data
    const columns = [
      { name: 'fullname', align: 'left', label: 'full name', field: 'fullname', sortable: true },
      { name: 'email', align: 'left', label: 'email', field: 'email', sortable: true },
      { name: 'role', align: 'left', label: 'role', field: 'role', sortable: true },
      {
        name: 'hiredAt',
        align: 'left',
        label: 'hire date',
        field: row => {
          if (row.hiredAt === null) {
            return row.hiredAt
          } else {
            return format(new Date(row.hiredAt), 'dd-MM-yyyy')
          }
        },
        sortable: true
      },
      {
        name: 'endEmploymentAt',
        align: 'left',
        label: 'end employment date',
        field: row => {
          if (row.endEmploymentAt === null) {
            return row.endEmploymentAt
          } else {
            return format(new Date(row.endEmploymentAt), 'dd-MM-yyyy')
          }
        },
        sortable: true
      },
      {
        name: 'department',
        align: 'left',
        label: 'department',
        field: row => row.department ? row.department.name : '',
        sortable: true
      },
      {
        name: 'supervisor',
        align: 'left',
        label: 'supervisor',
        field: row => {
          const supervisorName = lodash.find(mems.value, { id: row.supervisor })
          if (row.supervisor === '') {
            return row.supervisor
          } else {
            return supervisorName ? supervisorName.fullname : ''
          }
        },
        sortable: true
      },
      {
        name: 'tableActions',
        align: 'left',
        label: 'actions',
        field: 'tableActions',
        sortable: true
      }
    ]
    // Get Current User from State
    const loggedUser = computed(() => store.getters['user/getUser'])

    // Selected Field in Toggle Button
    const selectedField = computed(() => {
      if (radioValue.value === 2) return 'All'
      else if (radioValue.value === 0) return 'Active'
      else return 'Fired'
    })

    // Arrows button in paginated table
    const onRequest = payload => {
      pagination.value.page = payload.pagination.page
      pagination.value.rowsPerPage = payload.pagination.rowsPerPage
    }

    // calculate pagination variables
    const variables = computed(() => {
      return {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        filter: search.value,
        flag: radioValue.value
      }
    })

    // fetch paginated Members
    const { result, loading, onResult, refetch: refetchMembers } = useQuery(
      getFilteredMembers,
      variables
    )
    const paginateMembers = computed(() => (result.value ? result.value.users.data : []))
    onResult(() => {
      pagination.value.rowsNumber = result.value.users.total
    })

    // Fetch all Users to find the Supervisor
    const { result: allUsers, refetch: refetchSupers } = useQuery(getAllMembers)
    const mems = computed(() => {
      return allUsers.value ? allUsers.value.users : []
    })

    return {
      columns,
      loggedUser,
      paginateMembers,
      loading,
      RentalDialogRef,
      DialogRef,
      search,
      selectedField,
      pagination,
      onRequest,
      refetchMembers,
      radioValue,
      radioOptions,
      mems,
      refetchSupers
    }
  }
})
</script>
