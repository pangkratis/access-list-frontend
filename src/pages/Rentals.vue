<template>
  <q-page class="q-pa-md text-center text-h3 animate__animated animate__zoomIn">
    <div class="flex row justify-between">
      <div class="col-8"></div>
      <div class="col-2 bg-transparent rounded-borders q-mt-xl">
        <q-tabs
          v-model="tab"
          dense
          active-color="primary"
          indicator-color="transparent"
          no-caps
          class=" bg-white"
          style="width: 200px"
        >
          <q-tab name="openRents" class="shadow-1">
            <q-icon class="material-icons" size="sm">
              lock_open
            </q-icon>
            <p class="text-body1 q-mb-none">
              open
            </p>
          </q-tab>
          <q-tab name="closedRents">
            <q-icon class="material-icons" size="sm">
              assignment_returned
            </q-icon>
            <p class="text-body1 q-mb-none">
              returned
            </p>
          </q-tab>
        </q-tabs>
      </div>
    </div>

      <q-tab-panels v-model="tab" animated class="bg-transparent">
        <!-- OPEN RENTS -->
        <q-tab-panel name="openRents">
          <div class="fixed-center" style="width: 1000px; height: auto">
            <q-table
              title="Open Rentals"
              class="rounded-borders shadow-9"
              :data="openRents"
              :columns="columns"
              :loading="openRentalsLoading"
              :filter="openSearch"
              :pagination.sync="pagination"
              row-key="name"
              flat
              style="border-radius: 30px"
            >
        <template v-slot:top-right>
          <!-- Search input -->
          <q-input
            class="q-pa-sm"
            rounded
            color="secondary"
            outlined
            dense
            clearable
            debounce="120"
            v-model="openSearch"
            placeholder="Search..."
          >
            <template v-slot:append>
              <q-icon class="q-mt-sm text-secondary" name="search" />
            </template>
          </q-input>
          <!-- Add Button -->
          <div class="column justify-center">
            <q-tooltip>
                create new rental
              </q-tooltip>
            <q-btn
              :disable="loggedUser.role !== 'Admin' && loggedUser.groupsManager.length === 0"
              rounded
              color="secondary"
              icon="data_saver_on"
              class="btn"
              @click="DialogRef.open()"
              push
              flat
            />
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

        <!-- to Column -->
              <template v-slot:body-cell-to="props">
                <q-td :props="props">
                  <div v-if="props.row.to === null">
                    <q-icon name="timelapse" color="info" size="md" />
                  </div>
                </q-td>
              </template>

        <!-- Actions Column -->
              <template v-slot:body-cell-selectActions="props">
                <q-td :props="props">
                  <q-btn
                    :disable="!isBtnDisabled(props.row.item)"
                    color="secondary"
                    icon="settings"
                    class="btn"
                    push
                    flat
                  >
                    <q-menu transition-show="flip-right" transition-hide="flip-left">
                      <q-list>
                        <q-item clickable>
                          <q-item-section @click="DialogRef.open(props.row)">
                            Edit
                          </q-item-section>
                        </q-item>
                        <q-item clickable>
                          <q-item-section @click="ReturnDialogRef.open(props.row)">
                            Return
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>
        </q-tab-panel>

        <!-- CLOSE RENTS -->
        <q-tab-panel name="closedRents">
          <div class="fixed-center" style="width: 1000px; height: 500px">
            <q-table
              title="Close Rentals"
              class="rounded-borders shadow-9"
              :data="closedRents"
              :columns="columns"
              :loading="closedRentalsLoading"
              :filter="closedSearch"
              :pagination.sync="pagination"
              row-key="name"
              flat
              style="border-radius: 30px"
            >
        <!-- Search input -->
        <template v-slot:top-right>
          <q-input
            class="q-pa-sm"
            color="secondary"
            rounded
            outlined
            dense
            clearable
            debounce="120"
            v-model="closedSearch"
            placeholder="Search..."
          >
            <template v-slot:append>
              <q-icon class="q-mt-sm text-secondary" name="search" />
            </template>
          </q-input>

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

        <!-- to Column -->
              <template v-slot:body-cell-to="props">
                <q-td :props="props">
                  <div v-if="props.row.to === null">
                    <q-icon name="timelapse" color="info" size="md" />
                  </div>
                </q-td>
              </template>

              <!-- Actions Column -->
              <template v-slot:body-cell-selectActions="props">
                <q-td :props="props">
                  <q-btn
                    :disable="!isBtnDisabled(props.row.item)"
                    color="secondary"
                    icon="settings"
                    class="btn"
                    push
                    flat
                  >
                    <q-menu transition-show="scale" transition-hide="scale">
                      <q-list>
                        <q-item clickable>
                          <q-item-section @click="ReturnDialogRef.open(props.row)">
                            Edit
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </div>
        </q-tab-panel>
      </q-tab-panels>

    <RentalDialog ref="DialogRef" />
    <ReturnDialog ref="ReturnDialogRef" />
  </q-page>
</template>

<script>
// Vue
import store from 'src/store'
import { defineComponent, ref, reactive, computed, onMounted } from '@vue/composition-api'
// Apollo
import { useQuery } from '@vue/apollo-composable'
// Queries - Mutations
import { getOpenRents, getClosedRents } from 'src/assets/gql/queries/rentals'
// Components
import RentalDialog from '../components/RentDialog.vue'
import ReturnDialog from '../components/ReturnDialog.vue'
// Libraries
import { format } from 'date-fns'

export default defineComponent({
  name: 'Rentals',
  components: {
    RentalDialog,
    ReturnDialog
  },
  setup () {
    // References
    const ReturnDialogRef = ref(null)
    const DialogRef = ref(null)
    // pagination
    const pagination = reactive({
      rowsPerPage: 5
    })
    const tab = ref('openRents')
    const openSearch = ref('')
    const closedSearch = ref('')

    // Columns Data
    const columns = [
      {
        name: 'fullname',
        align: 'center',
        label: 'Rented by',
        field: row => {
          return row.user.fullname
        },
        sortable: true
      },
      {
        name: 'item',
        align: 'center',
        label: 'item',
        field: row => {
          return row.item.name
        },
        sortable: true
      },
      {
        name: 'comment',
        align: 'center',
        label: 'Comment',
        field: 'comment',
        sortable: true
      },
      {
        name: 'from',
        align: 'center',
        label: 'From',
        field: row => {
          return format(new Date(row.from), 'dd-MM-yyyy')
        },
        sortable: true
      },
      {
        name: 'to',
        align: 'center',
        label: 'To',
        field: row => {
          return format(new Date(row.to), 'dd-MM-yyyy')
        },
        sortable: true
      },
      {
        name: 'selectActions',
        align: 'center',
        label: 'Actions',
        field: 'selectActions',
        sortable: true
      }
    ]

    // Current User from State
    const loggedUser = computed(() => store.getters['user/getUser'])

    // Get All Open Rentals
    const {
      result: openRentals,
      loading: openRentalsLoading,
      refetch: refetchOpenRents
    } = useQuery(getOpenRents, { fetchPolicy: 'network-only' })
    const openRents = computed(() => {
      return openRentals.value ? openRentals.value.openRentals : []
    })

    // Check permission
    const isBtnDisabled = item => {
      const managerId = item.group.manager.id
      if (loggedUser.value.role === 'Admin' || loggedUser.value.id === managerId) {
        return true
      }
      return false
    }

    // Get Closed Rentals
    const {
      result: closedRentals,
      loading: closedRentalsLoading,
      refetch: refetchClosedRents
    } = useQuery(getClosedRents, { fetchPolicy: 'network-only' })
    const closedRents = computed(() => {
      return closedRentals.value ? closedRentals.value.getClosedRentals : []
    })

    // Refetch Data
    onMounted(() => {
      refetchOpenRents()
      refetchClosedRents()
    })

    return {
      tab,
      DialogRef,
      ReturnDialogRef,
      loggedUser,
      isBtnDisabled,
      columns,
      pagination,
      openRents,
      openRentalsLoading,
      closedRents,
      closedRentalsLoading,
      openSearch,
      closedSearch
    }
  }
})
</script>
