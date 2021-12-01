<template>
  <q-page class="animate__animated animate__zoomIn">
    <div v-if="items.length > 0" class="q-pa-sm">
      <div class="q-pa-lg q-mt-none fixed-center">
        <div class="row justify-between q-ml-lg">
          <h4 class="text-center text-h6">
            Rentals for Item: <span class="history">{{ item }}</span>
          </h4>
        </div>
        <q-table
          :columns="columns"
          :loading="loading"
          :data="items"
          row-key="id"
          class="rounded-borders shadow-9"
          style="width: 1000px; max-height: 500px; border-radius: 30px">
          <!-- Item Column -->
          <template v-slot:body-cell-member="props">
            <q-td :props="props">
              {{ props.row.user.fullname }}
            </q-td>
          </template>
        </q-table>
      </div>
    </div>
    <div v-else class="row justify-around text-center q-pa-md">
      <h4>
        No Rentals found for Item: <span class="history">{{ item }}</span>
      </h4>
      <router-link class="back text-h5" :to="{ path: '/items' }"
        ><q-icon name="arrow_back" /><span class="text-h6">Back</span></router-link
      >
    </div>
  </q-page>
</template>

<script>
// Vue
import { computed, defineComponent, onMounted, ref } from '@vue/composition-api'
// Apollo
import { useQuery } from '@vue/apollo-composable'
// Queries - Mutations
import { getItem } from 'src/assets/gql/queries/items'
// Libraries
import { format } from 'date-fns'

export default defineComponent({
  name: 'ItemsHistory',
  setup (_props, { root }) {
    const columns = [
      {
        name: 'member',
        required: true,
        label: 'Rented By',
        align: 'left',
        field: 'item',
        sortable: true
      },
      {
        name: 'from',
        required: true,
        label: 'From',
        align: 'left',
        field: row => {
          if (row.from === null) {
            return row.from
          } else {
            return format(new Date(row.from), 'dd-MM-yyyy')
          }
        },
        sortable: true
      },
      {
        name: 'to',
        required: true,
        label: 'To',
        align: 'left',
        field: row => {
          if (row.to === null) {
            return 'Renting is in progress'
          } else {
            return format(new Date(row.to), 'dd-MM-yyyy')
          }
        },
        sortable: true
      }
    ]
    const member = ref([])
    const item = ref('')

    // Fetch Item in Current Page
    const {
      result: itemResult,
      loading,
      onResult: onItemResult,
      refetch: refetchItemsRentals
    } = useQuery(getItem, {
      id: root.$route.params.id
    })
    onItemResult(() => {
      item.value = itemResult.value.item.name
    })
    onMounted(() => {
      refetchItemsRentals()
    })

    // Extract rentals from Result
    const items = computed(() => {
      return itemResult.value ? itemResult.value.item.rentals : []
    })

    return {
      columns,
      member,
      loading,
      item,
      items
    }
  }
})
</script>
