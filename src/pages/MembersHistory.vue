<template>
  <q-page class="animate__animated animate__zoomIn">
    <div v-if="rentals.length > 0" class="q-pa-sm">
      <div class="row justify-around">
        <h4 class="text-center text-h4">
          Rentals for Member: <span class="history">{{ name }}</span>
        </h4>
        <router-link class="back text-h5" :to="{ path: '/members' }"
          ><q-icon name="arrow_back" /><span class="text-h6">Back</span></router-link
        >
      </div>
      <div class="q-pa-lg q-mt-md">
        <q-table :columns="columns" :loading="loading" :data="rentals" row-key="id">
          <!-- Member Column -->
          <template v-slot:body-cell-item="props">
            <q-td :props="props">
              {{ props.value.name }}
            </q-td>
          </template>
        </q-table>
      </div>
    </div>

    <div v-else class="row justify-around text-center q-pa-md">
      <h4 class="text-center text-h4">
        No Rentals found for Member: <span class="history">{{ name }}</span>
      </h4>
      <router-link class="back text-h5" :to="{ path: '/members' }"
        ><q-icon name="arrow_back" /><span class="text-h6">Back</span></router-link
      >
    </div>
  </q-page>
</template>

<script>
// Vue
import { computed, defineComponent, ref } from '@vue/composition-api'
// Apollo
import { useQuery } from '@vue/apollo-composable'
// Queries - Mutations
import { getUser } from 'src/assets/gql/queries/user'
// Libraries
import { format } from 'date-fns'

export default defineComponent({
  name: 'MembersHistory',
  setup (_props, { root }) {
    // Columns Data
    const columns = [
      {
        name: 'item',
        required: true,
        label: 'Item',
        align: 'center',
        field: 'item',
        sortable: true
      },
      {
        name: 'from',
        required: true,
        label: 'From',
        align: 'center',
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
        align: 'center',
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

    // Fetch User in Current Page
    const { result: memberResult, loading, onResult: onMemberResult } = useQuery(getUser, {
      id: root.$route.params.id
    })
    const name = ref('')
    onMemberResult(() => {
      name.value = memberResult.value.user.fullname
    })

    // Extract rentals from Result
    const rentals = computed(() => (memberResult.value ? memberResult.value.user.rentals : []))

    return {
      columns,
      loading,
      name,
      rentals,
      memberResult
    }
  }
})
</script>
