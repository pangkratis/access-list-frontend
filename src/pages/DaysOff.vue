<template>
  <div class="q-ma-lg">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
      rel="stylesheet">
      <link href="https://fonts.googleapis.com/icon?family=Material+Icons"
      rel="stylesheet">

    <!-- Calendar -->
    <div class="fixed-center bg-white q-pa-lg shadow-19" style="border-radius: 30px">
      <q-btn class="q-mb-md" style="background: #1a7a4c; color: white" label="request day off" @click="RequestDayOffDialogRef.openRequestDayOffDialog()" no-caps/>
      <FullCalendar :options="calendarOptions" />
    </div>
  <RequestDayOffDialog ref="RequestDayOffDialogRef"/>
  </div>

</template>

<script>
import { defineComponent, onMounted, computed, ref, watchEffect } from '@vue/composition-api'
import RequestDayOffDialog from '../components/RequestDayOffDialog.vue'
// Apollo
import { useQuery, useResult } from '@vue/apollo-composable'
import { getRegisteredDaysOff } from '../assets/gql/queries/dayoff'

// Full calendar
import FullCalendar from '@fullcalendar/vue'
import '@fullcalendar/core/vdom'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

// Date format
import { format } from 'date-fns'

export default defineComponent({
  name: 'DaysOff',
  components: {
    FullCalendar,
    RequestDayOffDialog
  },
  setup () {
    const RequestDayOffDialogRef = ref(null)

    // Get registered days off  query
    const {
      result: registeredDaysOffResult,
      refetch: refetchRegisteredDayOff
    } = useQuery(getRegisteredDaysOff)
    const registered = useResult(registeredDaysOffResult, []) // idk

    onMounted(() => {
      refetchRegisteredDayOff()
    })

    // fucntion for random dark color
    const randDarkColor = () => {
      const lum = -0.25
      let hex = String('#' + Math.random().toString(16).slice(2, 8).toUpperCase()).replace(/[^0-9a-f]/gi, '')
      if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      let rgb = '#',
        c, i
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16)
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
        rgb += ('00' + c).substr(c.length)
      }
      return rgb
    }

    // Events Array that will populate the fullcalendar
    const eventsArray = ref([])
    const registeredDayOffStartDate = computed(() => {
      registered.value.forEach(i => {
        const endDay = new Date(i.end)
        const beforeDay = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate() + 1)

        eventsArray.value.push({
          title: i.user.fullname,
          start: format(new Date(i.start), 'yyyy-MM-dd'),
          end: format(new Date(beforeDay), 'yyyy-MM-dd'),
          borderColor: '#ffffff',
          backgroundColor: randDarkColor() // auto generate random colors
        })
      })
      return eventsArray.value
    })
    watchEffect(() => {
      console.log(registeredDayOffStartDate.value)
    })

    const selectD = (value) => {
      RequestDayOffDialogRef.value.selectRequestDayOffDialog(value)
    }
    return {
      RequestDayOffDialogRef,
      calendarOptions: {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        weekends: true,
        selectable: true,
        select: selectD,
        dateClick: selectD,
        height: 'auto',
        events: registeredDayOffStartDate.value // events array to populate the calendar
      }// options for full calendar to work
    }
  }
})
</script>
