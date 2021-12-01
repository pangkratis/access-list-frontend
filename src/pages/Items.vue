<template>
  <q-page class="animate__animated animate__fadeInDown">
    <div class="fixed-center">
       <q-table
        title="Items"
        class="rounded-borders shadow-9"
        :data="items"
        :columns="columns"
        :loading="loading"
        :filter="search"
        :pagination.sync="pagination"
        @request="onRequest"
        row-key="name"
        flat
        style="width: 1000px; max-height: 500px; border-radius: 30px"
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
            v-model="search"
            placeholder="Search..."
          >
            <template v-slot:append>
              <q-icon class="q-mt-sm text-secondary" name="search" />
            </template>
          </q-input>
           <div>
            <q-tooltip>
              filter items
            </q-tooltip>
            <q-btn-dropdown
              color="secondary"
              dense
              class="q-pa-xs"
              dropdown-icon="filter_list"
              flat
              push
            >
              <div class="q-pa-md">
                <q-option-group
                  v-model="groupIds"
                  :options="groupOptions"
                  color="secondary"
                  type="toggle"
                ></q-option-group>
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
                create new item
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

         <!-- Availability Column -->
        <template v-slot:body-cell-available="props">
          <q-td :props="props">
            <div v-if="props.row.available === true && props.row.type !== 'System'">
              <q-icon name="check_circle_outline" color="info" size="sm" />
            </div>
            <div v-else-if="props.row.available === false && props.row.type !== 'System'">
              <q-icon name="block" color="negative" size="sm" />
            </div>
            <div v-else>
              <q-icon name="published_with_changes" color="info" size="md" />
            </div>
          </q-td>
        </template>

        <!-- Actions Column -->
        <template v-slot:body-cell-tableActions="props">
          <q-td :props="props">
            <q-btn color="secondary" icon="settings" flat>
              <q-menu transition-show="flip-right" transition-hide="flip-left">
                  <q-list dense>
                    <q-item clickable>
                      <q-item-section @click="DialogRef.open(props.row)"> Edit </q-item-section>
                    </q-item>
                    <q-item clickable>
                      <q-item-section @click="itemDelete(props.row.id)"> Delete </q-item-section>
                    </q-item>
                    <q-item v-if="props.row.available" clickable>
                      <q-item-section @click="RentDialogRef.open({ item: props.row })">
                        Rent Item
                      </q-item-section>
                    </q-item>
                    <q-item clickable>
                      <q-item-section @click="$router.replace(`/item/${props.row.id}`)">
                        Rental History
                      </q-item-section>
                    </q-item>
                  </q-list>
              </q-menu>
            </q-btn>
          </q-td>
        </template>
      </q-table>
      <ItemDialog ref="DialogRef" @refetchItems="refetchItems" />
      <RentDialog ref="RentDialogRef" @refetchItems="refetchItems" />
    </div>
  </q-page>
</template>

<script>
// Vue and Quasar
import {
  defineComponent,
  ref,
  computed,
  onMounted,
  watch,
  onBeforeMount
} from '@vue/composition-api'
import { Notify, Dialog } from 'quasar'
import store from 'src/store'
// Apollo
import { useMutation, useQuery } from '@vue/apollo-composable'
// Queries - Mutations
import { getFilteredItems, getAllAssetItems, getAvailableItems } from 'src/assets/gql/queries/items'
import { getClosedRents, getOpenRents } from 'src/assets/gql/queries/rentals'
import { getAllGroups } from 'src/assets/gql/queries/groups'
import { deleteItem } from 'src/assets/gql/mutations/item'
// Components
import ItemDialog from '../components/ItemDialog.vue'
import RentDialog from '../components/RentDialog.vue'

export default defineComponent({
  name: 'Item',
  components: {
    ItemDialog,
    RentDialog
  },
  setup () {
    // Pagination
    const pagination = ref({
      page: 1,
      rowsPerPage: 7,
      rowsNumber: 10
    })

    const DialogRef = ref(null)
    const RentDialogRef = ref(null)
    const groupIds = ref([])
    const search = ref('')

    // Colums Data
    const columns = [
      { name: 'item', align: 'center', label: 'Item', field: 'name', sortable: true },
      {
        name: 'group',
        align: 'center',
        label: 'Group',
        field: row => {
          return row.group.title
        },
        sortable: true
      },
      {
        name: 'user',
        align: 'center',
        label: 'Rented by',
        field: row => {
          return itemsUsersMap.value[row.id] ? itemsUsersMap.value[row.id] : ''
        },
        sortable: true
      },
      { name: 'type', align: 'center', label: 'Type', field: 'type', sortable: true },
      {
        name: 'available',
        align: 'center',
        label: 'Availability',
        field: 'available',
        sortable: true
      },
      {
        name: 'tableActions',
        align: 'center',
        label: 'Actions',
        field: 'tableActions',
        sortable: true
      }
    ]

    // Current User from State
    const loggedUser = computed(() => store.getters['user/getUser'])

    // Arrows button in paginated table
    const onRequest = payload => {
      pagination.value.page = payload.pagination.page
      pagination.value.rowsPerPage = payload.pagination.rowsPerPage
    }

    // Fetch all Groups
    const { result: getGroups } = useQuery(getAllGroups)
    const allGroups = computed(() => (getGroups.value ? getGroups.value.groups : []))
    // calculate group ids when page changed
    onMounted(() => {
      groupIds.value = allGroups.value.map(group => group.id)
      refetchItems()
    })

    // calculate group ids when toggle value is changed
    watch(allGroups, () => {
      groupIds.value = allGroups.value.map(group => group.id)
    })

    // calculate group options for toogle
    const groupOptions = computed(() =>
      allGroups.value.map(group => {
        return {
          label: group.title,
          value: group.id
        }
      })
    )

    // calculate pagination variables
    const variables = computed(() => {
      return {
        page: pagination.value.page,
        limit: pagination.value.rowsPerPage,
        filter: search.value,
        groupIds: groupIds.value
      }
    })
    // Get paginated Items
    const { result, loading, onResult, refetch: refetchItems } = useQuery(
      getFilteredItems,
      variables,
      { fetchPolicy: 'network-only' }
    )
    const items = computed(() => {
      return result.value ? result.value.items.data : []
    })
    onResult(() => {
      pagination.value.rowsNumber = result.value.items.total
    })
    onBeforeMount(() => {
      refetchItems()
    })

    // fetch only asset type items for rentals
    const { result: assetItems } = useQuery(getAllAssetItems)
    const rentsWithassetItems = computed(() => {
      return assetItems.value ? assetItems.value.assetItems : []
    })

    // Get user by item
    const itemsUsersMap = computed(() =>
      rentsWithassetItems.value.reduce((acc, cur) => {
        acc[cur.item.id] = cur.user.fullname
        return acc
      }, {})
    )

    // Delete request
    const { mutate: deleteItemAction } = useMutation(deleteItem, () => ({
      refetchQueries: [
        { query: getAvailableItems },
        { query: getAllGroups },
        { query: getOpenRents },
        { query: getClosedRents }
      ]
    }))

    // Delete item method
    const itemDelete = id => {
      Dialog.create({
        color: 'secondary',
        persistent: true,
        cancel: true,
        title: 'Delete Item',
        ok: 'Yes',
        message: 'Are you sure you want to delete this Item ?'
      }).onOk(() => {
        deleteItemAction({ id: id })
          .then(() => {
            Notify.create({
              position: 'bottom-right',
              message: 'Item deleted',
              color: 'secondary',
              type: 'positive'
            })
            refetchItems()
          })
          .catch(error => {
            Notify.create({
              position: 'bottom-right',
              message: error.message.split(':').pop(),
              color: 'negative',
              type: 'negative'
            })
          })
      })
    }

    return {
      columns,
      DialogRef,
      RentDialogRef,
      loggedUser,
      items,
      loading,
      search,
      groupIds,
      itemDelete,
      groupOptions,
      pagination,
      onRequest,
      refetchItems,
      allGroups
    }
  }
})
</script>
