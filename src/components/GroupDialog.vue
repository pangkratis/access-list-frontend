<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="seen">
      <q-layout view="Lhh lpR fff" style="height: 450px; border-radius: 30px" container class="bg-white">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title>{{ mode }} Group</q-toolbar-title>
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
                v-model="name"
                label="Name"
                ref="nameInput"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Name is required.']"
              />
            </div>
            <div class="q-pa-sm">
              <div class="q-gutter-md row items-start">
                <q-input
                  outlined
                  rounded
                  label="Pick a Color"
                  clearable
                  v-model="color"
                  ref="colorInput"
                  color="secondary"
                  lazy-rules
                  :rules="[val => (val && val.length > 0) || 'Color is required.']"
                >
                  <template v-slot:append>
                    <q-icon name="colorize" class="cursor-pointer">
                      <q-popup-proxy transition-show="scale" transition-hide="scale">
                        <q-color v-model="color" />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>
            <div class="q-pa-sm">
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
                color="secondary"
                label="Group manager"
                :options="filteringMembers"
                @filter="search"
                option-label="fullname"
                option-value="id"
                :value="manager"
                v-model="manager"
                options-selected-class="text-info"
                ref="groupManagerInput"
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Group Manager is required.']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No Manager found
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
          </q-page>
        </q-page-container>
      </q-layout>
    </q-dialog>
  </div>
</template>

<script>
// Vue and Quasar
import { defineComponent, ref, watch, computed } from '@vue/composition-api'
import { Notify } from 'quasar'
// graphQL
import { useQuery, useMutation } from '@vue/apollo-composable'
// Queries - Mutations
import { getAllMembers } from 'src/assets/gql/queries/user'
import { createGroup, updateGroup } from 'src/assets/gql/mutations/group'

export default defineComponent({
  name: 'GroupDialog',
  setup (_, { emit }) {
    // Input Validations
    const nameInput = ref(null)
    const groupManagerInput = ref(null)
    const colorInput = ref(null)

    const name = ref('')
    const manager = ref('')
    const color = ref('')
    const seen = ref(false)
    const filteringMembers = ref([])
    const groupRow = ref(null)

    // constantly watch the values in open and close form actions
    watch(seen, seenValue => {
      if (!seenValue) {
        name.value = ''
        color.value = ''
        manager.value = ''
        groupRow.value = null
      }
    })

    // Create Group Mutation
    const { mutate: createGroupMutation } = useMutation(createGroup, () => ({
      variables: {
        data: {
          title: name.value,
          color: color.value,
          manager: manager.value
        }
      }
    }))

    // Update Group Mutation
    const { mutate: updateGroupMutation } = useMutation(updateGroup, () => ({
      variables: {
        id: groupRow.value.id,
        data: {
          title: name.value,
          color: color.value,
          manager: manager.value
        }
      }
    }))

    // Add & Edit Dialog Mode
    const mode = computed(() => {
      return groupRow.value ? 'Edit' : 'Add'
    })

    // Open Dialog
    const open = (payload = false) => {
      if (payload !== false) {
        name.value = payload.title
        color.value = payload.color
        manager.value = payload.manager.id
        groupRow.value = payload
      }
      seen.value = true
    }

    // Form submition
    const submit = () => {
      // validate input
      const n = nameInput.value.validate()
      const g = groupManagerInput.value.validate()
      const c = colorInput.value.validate()

      if (!n || !g || !c) {
        return false
      } else {
        if (mode.value === 'Add') {
          createGroupMutation()
            .then(() => {
              emit('refetchGroups')
              seen.value = false
              Notify.create({
                position: 'bottom-right',
                message: 'New Group added',
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
          updateGroupMutation()
            .then(() => {
              emit('refetchGroups')
              seen.value = false
              Notify.create({
                position: 'bottom-right',
                message: 'Group updated',
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

    // Get All Members from Server
    const { result, onResult } = useQuery(getAllMembers)
    const members = computed(() =>
      result.value ? result.value.users.filter(user => user.endEmploymentAt === null) : []
    )
    onResult(() => {
      filteringMembers.value = members.value
    })

    // Search Members in select input
    const search = (val, update) => {
      update(() => {
        const needle = val.toLowerCase()
        filteringMembers.value = members.value.filter(
          v => v.fullname.toLowerCase().indexOf(needle) > -1
        )
      })
    }

    return {
      name,
      manager,
      color,
      seen,
      members,
      mode,
      open,
      nameInput,
      groupManagerInput,
      colorInput,
      submit,
      search,
      filteringMembers
    }
  }
})
</script>
