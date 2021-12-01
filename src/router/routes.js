// Vue
import { computed } from '@vue/composition-api'
import store from 'src/store'

// Current User from State
const loggedUser = computed(() => store.getters['user/getUser'])

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'Index', component: () => import('pages/Index.vue') },
      { path: 'members', name: 'Members', component: () => import('pages/Members.vue') },
      {
        path: 'member/:id',
        name: 'MembersHistory',
        component: () => import('src/pages/MembersHistory.vue')
      },
      {
        path: 'groups',
        name: 'Groups',
        component: () => import('pages/Groups.vue'),
        beforeEnter: (_to, _from, next) => {
          if (loggedUser.value) {
            if (loggedUser.value.role !== 'Admin' && loggedUser.value.groupsManager.length === 0) {
              next({ name: 'Index' })
              next()
            } else next()
          }
        }
      },
      {
        path: 'items',
        name: 'Item',
        component: () => import('pages/Items.vue'),
        beforeEnter: (_to, _from, next) => {
          if (loggedUser.value) {
            if (loggedUser.value.role !== 'Admin' && loggedUser.value.groupsManager.length === 0) {
              next({ name: 'Index' })
            } else next()
          }
        }
      },
      {
        path: 'item/:id',
        name: 'ItemsHistory',
        component: () => import('src/pages/ItemsHistory.vue')
      },
      { path: 'rentals', name: 'Rentals', component: () => import('pages/Rentals.vue') },
      { path: 'daysoff', name: 'DaysOff', component: () => import('pages/daysoff.vue') },
      { path: 'departments', name: 'Departments', component: () => import('pages/departments.vue') },
      { path: 'acceptedDaysOff', name: 'Accepted DaysOff', component: () => import('pages/AcceptedDaysOff.vue') },
      { path: 'pendingDaysOff', name: 'Pending DaysOff', component: () => import('pages/PendingDaysOff.vue') },
      { path: 'member/daysoff/:id', name: 'UsersDaysOff', component: () => import('pages/UsersDaysOff.vue') },
      { path: 'departments/daysoff/:id', name: 'DepartmentsDaysOff', component: () => import('pages/DepartmentsDaysOffHistory.vue') }

    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
