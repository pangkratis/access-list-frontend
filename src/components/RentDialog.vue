<template>
  <div class="q-pa-sm q-gutter-sm">
    <q-dialog v-model="seen">
      <q-layout view="Lhh lpR fff" style="height: 530px; border-radius: 30px" container class="bg-white">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title> {{ editMode ? 'Edit' : 'Add' }} Rental</q-toolbar-title>
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
              <q-select
                rounded
                outlined
                use-input
                hide-selected
                fill-input
                map-options
                emit-value
                clearable
                input-debounce="0"
                transition-show="scale"
                transition-hide="scale"
                label="Select Member"
                :options="filteringMembers"
                option-label="fullname"
                option-value="id"
                v-model="member"
                :value="member"
                @filter="searchMembers"
                ref="validMemberInput"
                options-selected-class="text-info"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Member field is required.']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No Member found
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
                rounded
                outlined
                use-input
                hide-selected
                fill-input
                map-options
                emit-value
                clearable
                input-debounce="0"
                transition-show="scale"
                transition-hide="scale"
                label="Select Item"
                :options="filteringItems"
                option-label="name"
                option-value="id"
                v-model="item"
                :value="item"
                @filter="searchItems"
                ref="validItemInput"
                options-selected-class="text-info"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Item field is required.']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No Item found
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.name }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.group.title }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="q-pa-sm">
              <q-input
                rounded
                autogrow
                outlined
                v-model="comment"
                label="Comment"
                type="textarea"
                clearable
              />
            </div>
            <div class="q-pa-sm q-mt-sm" style="max-width: 300px">
              <q-input
                rounded
                outlined
                color="primary"
                label="From"
                v-model="from"
                clearable
                ref="validDateInput"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Date field is required.']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date minimal v-model="from" today-btn mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script>
// Vue and Quasar
import {
  defineComponent,
  ref,
  computed,
  onBeforeMount,
  onMounted,
  watch
} from '@vue/composition-api'
import { Notify } from 'quasar'
// Apollo
import { useMutation, useQuery } from '@vue/apollo-composable'
// Queries - Mutations
import { getAllAssetItems, getAvailableItems } from 'src/assets/gql/queries/items'
import { getAllMembers } from 'src/assets/gql/queries/user'
import { getOpenRents } from 'src/assets/gql/queries/rentals'
import { createRental, updateRental } from 'src/assets/gql/mutations/rentals'
// Libraries
import { format } from 'date-fns'
import lodash from 'lodash'
import { formatDateToISO } from 'src/assets/helpers/formatdate'

export default defineComponent({
  name: 'RentDialog',
  setup (_, { emit }) {
    // Input Validations Refs
    const validMemberInput = ref(null)
    const validItemInput = ref(null)
    const validDateInput = ref(null)

    const seen = ref(false)
    const member = ref('')
    const item = ref(null)
    const comment = ref('')
    const from = ref(null)

    // mode
    const editMode = ref(false)
    const filteringMembers = ref([])
    const filteringItems = ref([])
    // RentalPayload
    const editId = ref(null)
    // add and remove payload item in edit rental
    const addedPayloadItem = ref(false)

    // Clear input fields everytime the Dialog is closed
    watch(seen, seenValue => {
      if (!seenValue) {
        member.value = null
        item.value = null
        comment.value = null
        from.value = null
        editId.value = null
        editMode.value = false
        // add and remove payload item in edit rental
        if (addedPayloadItem.value) {
          availableItems.value.pop()
        }
        addedPayloadItem.value = false
      }
    })

    // Open Dialog
    const open = (payload = false) => {
      if (payload !== false) {
        if (payload.user && !payload.id) {
          member.value = payload.user.id
        } else if (payload.item && !payload.id) {
          item.value = payload.item.id
        } else if (payload.id) {
          // add and remove payload item in edit rental
          editId.value = payload.id

          if (!availableItems.value.includes(payload.item) && payload.item.type !== 'System') {
            availableItems.value.push(payload.item)
            addedPayloadItem.value = true
          }
          editMode.value = true
          member.value = payload.user.id
          item.value = payload.item.id
          comment.value = payload.comment
          from.value = format(new Date(payload.from), 'dd-MM-yyyy')
        } else {
          refetchAvailableItems()
        }
      }
      seen.value = true
    }

    // Form submition
    const submit = () => {
      // validate input
      const m = validMemberInput.value.validate()
      const i = validItemInput.value.validate()
      const d = validDateInput.value.validate()

      if (!m || !i || !d) {
        return false
      } else {
        if (editMode.value) {
          from.value = formatDateToISO(from.value)
          updateRentalMutation()
            .then(() => {
              emit('refetchItems')
              seen.value = false
              Notify.create({
                position: 'bottom-right',
                message: 'New Rental created',
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
        } else {
          from.value = formatDateToISO(from.value)
          createRentalMutation()
            .then(() => {
              emit('refetchItems')
              seen.value = false
              Notify.create({
                position: 'bottom-right',
                message: 'New Rental created',
                color: 'secondary',
                type: 'positive'
              })
            })
            .catch(error => {
              from.value = null
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

    // Get All Members
    const { result: MembersResult, onResult: onMembersResult } = useQuery(getAllMembers, {
      fetchPolicy: 'network-only'
    })
    const members = computed(() => {
      return MembersResult.value
        ? MembersResult.value.users.filter(user => user.endEmploymentAt === null)
        : []
    })
    onMembersResult(() => {
      filteringMembers.value = members.value
    })

    // Get All Available Items
    const {
      result: availableItemsResult,
      refetch: refetchAvailableItems,
      onResult: onItemsResult
    } = useQuery(getAvailableItems, { fetchPolicy: 'network-only' })
    const availableItems = computed(() => {
      return availableItemsResult.value ? availableItemsResult.value.items : []
    })
    onItemsResult(() => {
      filteringItems.value = availableItems.value
    })
    onBeforeMount(() => {
      refetchAvailableItems()
    })
    onMounted(() => {
      filteringItems.value = availableItems.value
    })

    // // Search Members in select input
    const searchMembers = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        filteringMembers.value = lodash.filter(members.value, v => {
          return v.fullname.toLowerCase().indexOf(needle) > -1
        })
      })
    }

    // Search Items in select input
    const searchItems = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        filteringItems.value = lodash.filter(availableItems.value, v => {
          return v.name.toLowerCase().indexOf(needle) > -1
        })
      })
    }

    // Create Rental Mutation
    const { mutate: createRentalMutation } = useMutation(createRental, () => ({
      variables: {
        data: {
          user: member.value,
          item: item.value,
          comment: comment.value,
          from: from.value
        }
      },
      refetchQueries: [
        { query: getOpenRents },
        { query: getAvailableItems },
        { query: getAllAssetItems }
      ]
    }))

    // Update Rental Mutation
    const { mutate: updateRentalMutation } = useMutation(updateRental, () => ({
      variables: {
        id: editId.value,
        data: {
          user: member.value,
          item: item.value,
          comment: comment.value,
          from: from.value
        }
      },
      refetchQueries: [
        { query: getOpenRents },
        { query: getAvailableItems },
        { query: getAllAssetItems }
      ]
    }))

    return {
      seen,
      member,
      item,
      comment,
      from,
      validMemberInput,
      validItemInput,
      validDateInput,
      editMode,
      open,
      submit,
      searchMembers,
      searchItems,
      filteringItems,
      availableItems,
      filteringMembers,
      refetchAvailableItems
    }
  }
})
</script>
