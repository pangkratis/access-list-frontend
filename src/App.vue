<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
// Apollo
import { apolloClient } from 'boot/apollo'
import { defineComponent, provide } from '@vue/composition-api'
import { DefaultApolloClient } from '@vue/apollo-composable'

export default defineComponent({
  name: 'App',
  setup () {
    provide(DefaultApolloClient, apolloClient)
  }
})
</script>
