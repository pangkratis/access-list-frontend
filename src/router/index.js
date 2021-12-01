import Vue from 'vue'
import VueRouter from 'vue-router'

import { authService } from 'src/boot/auth'
import routes from './routes'

import { Notify } from 'quasar'

Vue.use(VueRouter)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default function () {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })

  Router.beforeEach((to, _from, next) => {
    if (to.path === '/login') {
      authService
        .handleLoginRedirect()
        .then(() => {
          Notify.create({
            message: 'Successfully Logged in !',
            type: 'positive',
            color: 'secondary',
            position: 'top'
          })
          next('/')
        })
        .catch(error => {
          console.log(error)
          next('/')
        })
    } else if (to.path === '/logout') {
      authService
        .handleLogoutRedirect()
        .then(() => {
          next('/')
        })
        .catch(error => {
          console.log(error)
          next('/')
        })
    } else if (to.path === '/') {
      next()
    } else {
      authService.getProfile().then(response => {
        if (response) {
          next()
        } else {
          next('/')
        }
      })
    }
  })
  return Router
}
