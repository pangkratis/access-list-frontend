<template>
  <q-layout view="lHh Lpr lFf">
    <q-header>
      <q-toolbar class="bg-accent">
        <q-toolbar-title class="title text-grey-9 text-h6 q-ml-lg">
          Access Control Management System
        </q-toolbar-title>
        <div v-if="loggedUser" class="user q-pa-sm q-mr-xl">
          <q-item v-ripple>
            <q-item-section class="text-black">
              <div>
                <q-item-label class="q-mt-xs text-weight-bold text-caption">{{ loggedUser.fullname }}</q-item-label>
                <q-item-label class="role text-caption">{{ loggedUser.role }}</q-item-label>
              </div>
            </q-item-section>
          </q-item>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="250"
      content-class="bg-primary"
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      :breakpoint="500"
    >
      <q-list padding class="full-height column" style="background: rgb(60,88,106);
background: linear-gradient(0deg, rgba(60,88,106,1) 0%, rgba(47,65,77,1) 100%);">

        <div class="links q-mt-none">
          <EssentialLink v-for="link in DaysOffLink" :key="link.title" v-bind="link"/>

          <q-expansion-item
            expand-separator
            icon="work"
            label="Staff Manager"
            default-opened
          >
            <EssentialLink v-for="link in StaffManagerLinks" :key="link.title" v-bind="link"/>
          </q-expansion-item>

          <q-expansion-item
            expand-separator
            icon="group_work"
            label="Assets"
            default-opened
          >
            <EssentialLink v-for="link in AssetsLinks" :key="link.title" v-bind="link"/>
          </q-expansion-item>
          <q-expansion-item
            expand-separator
            icon="maps_home_work"
            label="Depertment"
            default-opened
          >
            <EssentialLink v-for="link in DepartmentLinks" :key="link.title" v-bind="link"/>
          </q-expansion-item>
        </div>
        <q-space />

        <div v-if="loggedUser" class="q-pa-sm q-mb-xs links">
          <q-item class="radius" clickable @click="logout()">
            <q-item-section avatar>
              <q-icon name="power_settings_new" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                Logout
              </q-item-label>
            </q-item-section>
          </q-item>
        </div>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
const StaffManagerLinksList = [
  {
    title: 'Members',
    caption: '',
    icon: 'groups',
    link: '/members'
  },
  {
    title: 'Accepted DaysOff',
    caption: '',
    icon: 'event_available',
    link: '/acceptedDaysOff'
  }
]

const AssetsLinkList = [
  {
    title: 'Groups',
    caption: '',
    icon: 'category',
    link: '/groups'
  },
  {
    title: 'Items',
    caption: '',
    icon: 'electrical_services',
    link: '/items'
  },
  {
    title: 'Rentals',
    caption: '',
    icon: 'schedule',
    link: '/rentals'
  }
]

const DepartmentLinkList = [
  {
    title: 'Departments',
    caption: '',
    icon: 'apartment',
    link: '/departments'
  },
  {
    title: 'Pending DaysOff',
    caption: '',
    icon: 'pending_actions',
    link: '/pendingDaysOff'
  }
]

const DaysOffLinkList = [
  {
    title: 'Day Off',
    caption: '',
    icon: 'weekend',
    link: '/daysoff'
  }
]

import EssentialLink from 'components/EssentialLink.vue'
// Vue % Quasar
import { defineComponent, onBeforeMount, ref, computed, watchEffect } from '@vue/composition-api'
import { Loading } from 'quasar'
// Authentication / Store
import { authService } from 'src/boot/auth'
import store from 'src/store'
// // Graphql
import { useQuery } from '@vue/apollo-composable'
import { currentUser } from 'src/assets/gql/queries/user'

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink
  },

  setup () {
    const leftDrawerOpen = ref(false)
    const miniState = ref(false)
    const loggedUser = computed(() => store.getters['user/getUser'])
    const login = () => {
      authService.login()
    }

    const logout = () => {
      authService.logout()
    }

    onBeforeMount(() => {
      // Get the profile data from current user
      authService.getProfile().then(response => {
        if (!response) {
          authService.login()
        }
      })
    })

    // Get Current User
    const { onError, onResult, loading } = useQuery(currentUser)
    onError(err => {
      throw err
    })
    onResult(response => {
      if (response.data) {
        // Commit current user in store
        store.commit('user/SET_USER', response.data.currentUser)
      }
    })

    watchEffect(() => {
      if (loading.value) {
        Loading.show()
      } else {
        Loading.hide()
      }
    })

    // Araay of links
    const StaffManagerLinks = ref(StaffManagerLinksList)
    const AssetsLinks = ref(AssetsLinkList)
    const DepartmentLinks = ref(DepartmentLinkList)
    const DaysOffLink = ref(DaysOffLinkList)

    // toggle menu
    const toggleLeftDrawer = () => {
      leftDrawerOpen.value = !leftDrawerOpen.value
    }

    return {
      StaffManagerLinks,
      AssetsLinks,
      DepartmentLinks,
      DaysOffLink,
      leftDrawerOpen,
      toggleLeftDrawer,
      login,
      miniState,
      logout,
      loggedUser
    }
  }
})
</script>
