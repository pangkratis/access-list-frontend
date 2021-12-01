<template>
  <div>
    <q-item
      v-if="loggedUser.role === 'Admin' || loggedUser.role === 'StaffManager'"
      clickable
      :to="link"
      active-class="menu"
      class="primary radius q-ma-sm"
    >
      <q-item-section avatar>
        <q-icon v-if="title === 'Day Off'" :name="icon" size="sm" class="image q-pt-sm q-pb-none"></q-icon>
        <q-icon v-else :name="icon" size="sm" class="image">
            <q-badge v-if="title === 'Accepted DaysOff' && accepted === true " floating color="red" rounded style="width: 3px; height: 0.01px;" />
            <q-badge v-if="title === 'Pending DaysOff' && pending === true " floating color="red" rounded style="width: 3px; height: 0.01px" />
        </q-icon>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
      </q-item-section>
    </q-item>

    <q-item
      v-if="loggedUser.role === 'User' && title !== 'Accepted DaysOff' && title !== 'Pending DaysOff' && title !== 'Groups' && title !== 'Items'"
      clickable
      :to="link"
      active-class="menu"
      class="primary radius q-ma-sm"
    >
      <q-item-section avatar>
        <q-icon v-if="title === 'Day Off'" :name="icon" size="sm" class="image q-pt-sm q-pb-none"></q-icon>
        <q-icon v-else :name="icon" size="sm" class="image">
            <q-badge v-if="title === 'Accepted DaysOff' && accepted === true " floating color="red" rounded style="width: 3px; height: 0.01px;" />
            <q-badge v-if="title === 'Pending DaysOff' && pending === true " floating color="red" rounded style="width: 3px; height: 0.01px" />
        </q-icon>
      </q-item-section>

      <q-item-section>
        <q-item-label>{{ title }}</q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import { defineComponent, computed } from '@vue/composition-api'

import store from 'src/store'

import { useQuery } from '@vue/apollo-composable'
import { pendingExists, acceptedExists } from '../assets/gql/queries/dayoff'

export default defineComponent({
  name: 'EssentialLink',
  props: {
    title: {
      type: String,
      required: true
    },

    caption: {
      type: String,
      default: ''
    },

    link: {
      type: String,
      default: '#'
    },

    icon: {
      type: String,
      default: ''
    }
  },
  setup () {
    // Current User from State
    const loggedUser = computed(() => store.getters['user/getUser'])

    const { result: pendingExistsResult } = useQuery(pendingExists)
    const { result: acceptedExistsResult } = useQuery(acceptedExists)

    const pending = computed(() => {
      return pendingExistsResult.value ? pendingExistsResult.value.pendingExists : []
    })
    const accepted = computed(() => {
      return acceptedExistsResult.value ? acceptedExistsResult.value.acceptedExists : []
    })
    return {
      loggedUser,
      pending,
      accepted
    }
  }
})
</script>
