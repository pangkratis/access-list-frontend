<template>
  <div>
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
      rel="stylesheet">
    <div class="q-pa-md">
      <!-- Create Department button -->
      <q-btn v-if="loggedUser.role === 'Admin'" flat color="green-9" class="q-my-md" rounded label="Create department" @click="CreateDepartmentDialog.openCreateDialog()"></q-btn>

      <q-table
        :data="departments"
        :columns="columns"
        row-key="name"
        flat
        grid
      >
        <template v-slot:item="props">
        <div
          class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition bounce-button"
          :style="props.selected ? 'transform: scale(0.95);' : ''"
        >
            <q-card
              style="background: rgba(191, 218, 204, 0.07);
                box-shadow: 0 8px 10px 0 rgba(63, 129, 96, 0.37);
                backdrop-filter: blur( 0px );
                -webkit-backdrop-filter: blur( 0px );
                border-radius: 20px;"
              >
              <q-list>
                  <!-- Department Name Section -->
                  <q-item-section class="flex row" @click="UpdateDialogRef.openUpdateDialog(props.row)">
                    <div class="flex row justify-center q-mt-md">
                    <q-icon name="apartment" size="md" color="grey-9"/>
                    <q-item class="justify-center text-body1">{{ props.row.name }}</q-item>
                    <q-tooltip>Department's Name</q-tooltip>
                    </div>
                  </q-item-section>
                  <div class="flex row justify-center" @click="UpdateDialogRef.openUpdateDialog(props.row)">
                    <q-separator  size="2px" color="green-5" style="width: 350px"/>
                  </div>

                  <!-- Department Manger Section -->
                  <q-item-section class="flex items-center q-mt-md" @click="UpdateDialogRef.openUpdateDialog(props.row)" style="flex-direction: row">
                    <div class="text-center flex col-2">
                      <q-icon class="col-1" name="person" size="sm" color="grey-9"/>
                      <q-item class="text-subtitle2 text-grey-8 col-11 q-pl-xs">{{ props.row.manager.fullname}}</q-item>
                      <q-tooltip>Department's Manger</q-tooltip>
                    </div>
                    <div class="col-6 q-ml-lg q-mb-sm">
                      <q-icon class="q-mr-md q-mt-sm" name="people" size="sm" color="grey-9">
                        <q-tooltip>Department's Members</q-tooltip>
                        <q-badge  color="teal-6" class="q-ml-sm">{{props.row.members.length}}</q-badge>
                      </q-icon>
                    </div>
                  </q-item-section>

                  <!-- Department Members Section -->
                  <q-item-section class="flex q-mt-md" @click="UpdateDialogRef.openUpdateDialog(props.row)" style="flex-direction: row">
                    <!-- <q-icon class="q-mr-md q-mt-sm" name="people" size="sm" color="grey-9">
                      <q-tooltip>Department Members</q-tooltip>
                      <q-badge  color="teal-6" class="q-ml-sm">{{props.row.members.length}}</q-badge>
                    </q-icon> -->
                    <!-- <span class="text-center" v-for="member in props.row.members.slice(0,3)" :key="member.id">
                      <q-avatar color="cyan-8" text-color="white" size="md">{{member.fullname.charAt(0)}}{{member.fullname.split(' ').pop().charAt(0)}}</q-avatar>
                      <q-tooltip>{{member.fullname}}</q-tooltip>
                    </span>
                    <div class="text-center q-ml-sm q-mt-sm" v-if="props.row.members.length >= 3">
                      <p class="text-grey-8">+{{props.row.members.length - 3}} more</p>
                    </div> -->
                  </q-item-section>

                <div style="overflow: hidden">

                  <!-- Department's Day Off History -->
                  <q-btn
                    v-if="loggedUser.role !== 'User' || loggedUser.id === props.row.manager.id || props.row.members.find(member => member.id === loggedUser.id)"
                    class="text-grey-8 float-right q-mt-sm q-mb-sm"
                    flat
                    rounded
                    @click="$router.replace(`/departments/daysoff/${props.row.id}`)"
                  >
                    <q-icon name="history"></q-icon>
                    <q-tooltip>
                      Department's day off history
                    </q-tooltip>
                  </q-btn>

                  <!-- Increase department's days off button to open dialog -->
                  <q-btn v-if="loggedUser.role === 'Admin'" class="text-grey-8 float-right q-mb-sm q-mt-sm" flat rounded @click="GiveDayOffDialogRef.openGiveDayOffDialog(props.row.id)">
                    <img src="https://img.icons8.com/cotton/24/000000/hand-holding-heart--v2.png"/>
                    <q-tooltip>
                      Give department's members day off
                    </q-tooltip>
                  </q-btn>
                </div>
              </q-list>
            </q-card>
        </div>
      </template>
      </q-table>
    </div>
    <div>

    <updateDepartmentDialog  ref="UpdateDialogRef" @fetchDepartments="fetchDepartmentsFn"/>
    <GiveDayOffDialog ref="GiveDayOffDialogRef"/>
    <CreateDepartmentDiaolog ref="CreateDepartmentDialog" @fetchDepartments="fetchDepartments"></CreateDepartmentDiaolog>

  </div>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, ref } from '@vue/composition-api'

import { useQuery } from '@vue/apollo-composable'
import { getDepartments } from '../assets/gql/queries/department'

import CreateDepartmentDiaolog from '../components/CreateDepartmentDialog.vue'
import updateDepartmentDialog from '../components/UpdateDepartmentDialog.vue'
import GiveDayOffDialog from '../components/GiveDayOffDialog.vue'

import store from 'src/store'

const columns = [
  {
    name: 'name',
    required: true,
    label: "Department's Name",
    field: row => row.name,
    align: 'left'
  },
  { name: 'manager', align: 'center', label: 'Manager', field: row => { return row.manager.fullname }, sortable: true }
]

export default defineComponent({
  components: {
    CreateDepartmentDiaolog,
    updateDepartmentDialog,
    GiveDayOffDialog
  },
  setup () {
    const loggedUser = computed(() => store.getters['user/getUser'])
    const addMemberDialog = ref(false)
    const giveDayOffDialog = ref(false)
    const UpdateDialogRef = ref(null)
    const GiveDayOffDialogRef = ref(null)
    const CreateDepartmentDialog = ref(null)
    const updateDialog = ref(false)
    const departmentsName = ref()
    const departmentsManagerName = ref(null)

    // Get all departments
    const {
      result: getDepartmentsResult,
      refetch: fetchDepartments
    } = useQuery(getDepartments)
    const departments = computed(() => {
      return getDepartmentsResult.value ? getDepartmentsResult.value.departments : []
    })
    onMounted(() => {
      fetchDepartments()
    })
    const fetchDepartmentsFn = () => {
      fetchDepartments()
    }
    return {
      columns,
      departments,
      updateDialog,
      departmentsName,
      addMemberDialog,
      fetchDepartments,
      giveDayOffDialog,
      departmentsManagerName,
      UpdateDialogRef,
      fetchDepartmentsFn,
      GiveDayOffDialogRef,
      CreateDepartmentDialog,
      loggedUser
    }
  }
})
</script>

<style scoped>
@keyframes bounce {

  40% {
    -webkit-transform: translateY(-10px);
    -ms-transform:     translateY(-10px);
    transform:         translateY(-10px)
  }
}
.bounce-button {
  -webkit-animation-duration: 0.2s;
  animation-duration: 1.2s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}
.bounce-button:hover {
  cursor: pointer;
  animation-name: bounce;
  -moz-animation-name: bounce;
}

.createButton :hover {
  background-color: gray
}
</style>
