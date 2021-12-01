<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="seen">
      <q-layout view="Lhh lpR fff" style="height: 450px; border-radius: 30px" container class="bg-white">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title>{{ mode }} Item</q-toolbar-title>
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
                clearable
                ref="nameInput"
                v-model="item"
                label="Name"
                :rules="[val => (val && val.length > 0) || 'Name is required.']"
              />
            </div>
            <div class="q-pa-sm">
              <q-select
                outlined
                rounded
                color="secondary"
                label="Select Group"
                transition-show="scale"
                transition-hide="scale"
                :options="groups"
                option-label="title"
                option-value="id"
                ref="groupInput"
                v-model="group"
                options-selected-class="text-info"
                map-options
                clearable
                emit-value
                :rules="[val => (val && val.length > 0) || 'Group is required.']"
              >
                <template v-slot:option="scope">
                  <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                    <q-item-section>
                      <q-item-label>{{ scope.opt.title }}</q-item-label>
                      <q-item-label caption>{{ scope.opt.manager.fullname }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
            <div class="q-pa-sm" style="max-width: 300px">
              <div class="q-gutter-sm">
                <q-select
                  outlined
                  rounded
                  transition-show="scale"
                  transition-hide="scale"
                  color="secondary"
                  ref="typeInput"
                  v-model="type"
                  :options="optionType"
                  clearable
                  options-selected-class="text-info"
                  label="Type"
                  :rules="[val => (val && val.length > 0) || 'Type is required.']"
                />
              </div>
            </div>
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script>
// Vue and Quasar
import { computed, defineComponent, ref, watch } from '@vue/composition-api'
import { Notify } from 'quasar'
// GraphQL
import { useQuery, useMutation } from '@vue/apollo-composable'
// Queries - Mutations
import { getAllGroups } from '../assets/gql/queries/groups'
import { createItem, updateItem } from '../assets/gql/mutations/item'

export default defineComponent({
  name: 'ItemDialog',
  setup (_, { emit }) {
    // Validation Inputs
    const nameInput = ref('')
    const groupInput = ref('')
    const typeInput = ref('')

    const item = ref('')
    const group = ref('')
    const type = ref('')
    const seen = ref(false)
    const itemRow = ref(null)
    const optionType = ref(['Asset', 'System'])

    // watch when seen is change value in open and close form actions
    watch(seen, seenValue => {
      if (!seenValue) {
        item.value = ''
        group.value = ''
        type.value = ''
        itemRow.value = null
      }
    })

    // Add & Edit Dialog Mode
    const mode = computed(() => {
      return itemRow.value ? 'Edit' : 'Add'
    })

    // open Dialog
    const open = (payload = false) => {
      if (payload !== false) {
        item.value = payload.name
        group.value = payload.group.id
        type.value = payload.type
        itemRow.value = payload
      }
      seen.value = true
    }

    // Create Item Mutation
    const { mutate: createItemMutation } = useMutation(createItem, () => ({
      variables: {
        data: {
          name: item.value,
          group: group.value,
          type: type.value
        }
      }
    }))

    // Update Item Mutation
    const { mutate: updateItemMutation } = useMutation(updateItem, () => ({
      variables: {
        id: itemRow.value.id,
        data: {
          name: item.value,
          group: group.value,
          type: type.value
        }
      }
    }))

    // submit action
    const submit = () => {
      // validate input
      const n = nameInput.value.validate()
      const g = groupInput.value.validate()
      const t = typeInput.value.validate()

      if (!n || !g || !t) {
        return false
      } else {
        if (mode.value === 'Add') {
          createItemMutation()
            .then(() => {
              emit('refetchItems')
              emit('refetchAvailableItems')
              emit('refetchGroups')
              seen.value = false
              Notify.create({
                position: 'bottom-right',
                message: 'New Item added',
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
        } else if (mode.value === 'Edit') {
          updateItemMutation()
            .then(() => {
              emit('refetchItems')
              emit('refetchAvailableItems')
              emit('refetchGroups')
              seen.value = false
              Notify.create({
                position: 'bottom-right',
                message: 'Item updated',
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

    // Get Data from GraphQL
    const { result } = useQuery(getAllGroups)
    const groups = computed(() => (result.value ? result.value.groups : []))

    return {
      item,
      group,
      type,
      seen,
      groups,
      itemRow,
      optionType,
      nameInput,
      groupInput,
      typeInput,
      mode,
      open,
      submit
    }
  }
})
</script>
