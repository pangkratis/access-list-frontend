<template>
  <div class="q-pa-md q-gutter-sm">
    <q-dialog v-model="seen">
      <q-layout view="Lhh lpR fff" style="height: 300px; border-radius: 30px" container class="bg-white">
        <q-header class="text-center">
          <q-toolbar>
            <q-toolbar-title> Return Rental </q-toolbar-title>
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
            <div class="date q-pa-sm" style="max-width: 350px">
              <q-input
                rounded
                outlined
                color="primary"
                label="To"
                v-model="to"
                ref="dateInput"
                clearable
                lazy-rules
                :rules="[val => (val && val.length > 0) || 'Date field is required.']"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date minimal v-model="to" today-btn mask="DD-MM-YYYY">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="dark" flat />
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
import { Notify } from 'quasar'
import { defineComponent, ref, watch } from '@vue/composition-api'
// graphQL
import { useMutation } from '@vue/apollo-composable'
// Queries - Mutations
import { getOpenRents, getClosedRents } from 'src/assets/gql/queries/rentals'
import { returnRental } from 'src/assets/gql/mutations/rentals'
import { getAllAssetItems, getAvailableItems } from 'src/assets/gql/queries/items'
// Libraries
import { format } from 'date-fns'
import { formatDateToISO } from 'src/assets/helpers/formatdate'

export default defineComponent({
  name: 'ReturnDialog',
  setup () {
    // Input validation Ref
    const dateInput = ref(null)

    const seen = ref(false)
    const to = ref('')
    const rentalRow = ref(null)

    // Watch input field everytime when the Dialog is closed or open
    watch(seen, seenValue => {
      if (!seenValue) {
        to.value = null
        rentalRow.value = null
      }
    })

    // Open Dialog
    const open = (payload = false) => {
      if (payload !== false) {
        to.value = payload.to ? format(new Date(payload.to), 'dd-MM-yyyy') : payload.to
        rentalRow.value = payload
      }
      seen.value = true
    }

    // Return Item and close Rental
    const { mutate: returnRent } = useMutation(returnRental, () => ({
      variables: {
        id: rentalRow.value.id,
        data: {
          to: to.value
        }
      },
      refetchQueries: [
        { query: getOpenRents },
        { query: getClosedRents },
        { query: getAllAssetItems },
        { query: getAvailableItems }
      ]
    }))

    // Submit Dialog Form
    const submit = () => {
      // validate input
      const d = dateInput.value.validate()

      if (!d) {
        return false
      } else {
        to.value = formatDateToISO(to.value)
        returnRent()
          .then(() => {
            seen.value = false
            Notify.create({
              position: 'bottom-right',
              message: 'Item returned successfully',
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

    return {
      seen,
      to,
      dateInput,
      open,
      submit
    }
  }
})
</script>
