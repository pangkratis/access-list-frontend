<template>
  <q-page class="animate__animated animate__zoomIn">

    <div class="q-ma-lg">
      <div class="fixed-center">

        <q-table
          title="Groups"
          class="rounded-borders shadow-9"
          :data="groups"
          :columns="columns"
          :loading="loading"
          :filter="search"
          :pagination.sync="pagination"
          row-key="name"
          flat
          style="width: 1000px; max-height: 500px; border-radius: 30px"

        >
          <template v-slot:top-right>
            <!-- Search input -->
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
                  create new group
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
                    <q-item clickable>
                      <q-item-section @click="DialogRef.open(props.row)"> Edit </q-item-section>
                    </q-item>
                    <q-item v-if="loggedUser.role === 'Admin'" clickable>
                      <q-item-section @click="groupDelete(props.row.id)"> Delete </q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </div>
      <GroupDialog ref="DialogRef" @refetchGroups="refetchGroups" />
      <ItemDialog @refetchGroups="refetchGroups" />
    </div>
  </q-page>
</template>

<script>
// Vue and Quasar
import { defineComponent, ref, computed, reactive, onMounted } from '@vue/composition-api'
import { Notify, Dialog } from 'quasar'
import store from 'src/store'
// Apollo
import { useQuery, useMutation } from '@vue/apollo-composable'
// Queries - Mutations
import { getAllGroups } from 'src/assets/gql/queries/groups'
import { deleteGroup } from '../assets/gql/mutations/group'
// Components
import GroupDialog from '../components/GroupDialog.vue'
import ItemDialog from '../components/ItemDialog.vue'

export default defineComponent({
  name: 'Groups',
  components: {
    GroupDialog,
    ItemDialog
  },
  setup () {
    // Pagination
    const pagination = reactive({
      page: 1,
      rowsPerPage: 7
    })

    // Column Data
    const columns = [
      { name: 'Title', align: 'center', label: 'Title', field: 'title', sortable: true },
      {
        name: 'manager',
        align: 'center',
        label: 'Group Manager',
        field: row => row.manager.fullname,
        sortable: true
      },
      {
        name: 'items',
        align: 'center',
        label: 'No Items',
        sortable: true,
        field: row => (row.items ? row.items.length : 0)
      },
      {
        name: 'tableActions',
        align: 'center',
        label: 'Actions',
        field: 'tableActions',
        sortable: true
      }
    ]

    const DialogRef = ref(null)
    const search = ref('')

    // Current User from State
    const loggedUser = computed(() => store.getters['user/getUser'])

    // Get All Groups from GraphQL
    const { result, loading, refetch: refetchGroups } = useQuery(getAllGroups)
    const groups = computed(() => (result.value ? result.value.groups : []))
    onMounted(() => {
      refetchGroups()
    })

    // Delete Group Action
    const { mutate: deleteGroupAction } = useMutation(deleteGroup)
    const groupDelete = id => {
      Dialog.create({
        color: 'secondary',
        persistent: true,
        cancel: true,
        title: 'Delete Group',
        ok: 'Yes',
        message: 'Are you sure you want to delete this Group?'
      }).onOk(() => {
        deleteGroupAction({ id: id })
          .then(() => {
            Notify.create({
              position: 'bottom-right',
              message: 'Group Deleted',
              color: 'secondary',
              type: 'positive'
            })
            refetchGroups()
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
      loggedUser,
      loading,
      DialogRef,
      groups,
      groupDelete,
      pagination,
      search,
      refetchGroups
    }
  }
})
</script>
