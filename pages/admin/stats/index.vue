<template>
  <main class="withFooter center">
    <AdminModalWrap @closeDlg="closeModal" mWidth="100%" :showDlg="showModal">
      <TheDetail :resId="resToShow"/>
    </AdminModalWrap>

    <AdminModalWrap @closeDlg="closeModal" mWidth="100%" origWidth="1200px" :showDlg="showUserChartModal">
      <h2 class="center">{{ $t('user') }}: {{ checkedUserName }}</h2>
      <template v-if="userChartStats && userChartStats.results" v-for="(levels, groupName) in userChartStats.results">
        <h2>{{ $t('group') }}: {{ groupName }}</h2>
        <div class="chartBox">
          <div v-for="(results, levelName) in levels">

            <the-chart v-if="results.length > 1" :results="results" type="line" :level="levelName"></the-chart>
            <div v-else class="doughnutChartBox">
              <div class="doughnutChart">
                <the-chart :results="results" type="doughnut" :level="levelName"></the-chart>
              </div>
            </div>
          </div>
        </div>
      </template>
      <the-loader v-else/>
    </AdminModalWrap>

    <AdminModalWrap @closeDlg="closeModal" mWidth="100%" origWidth="1200px" :showDlg="showGroupChartModal">
      <h2 class="center">{{ $t('group') }}: {{ checkedGroupName }}</h2>
      <div v-if="groupChartStats && groupChartStats.results">
        <the-group-chart :group="checkedGroupName" :groupId="checkedGroup" :results="groupChartStats.results" type="line"></the-group-chart>
      </div>
      <the-loader v-else/>
    </AdminModalWrap>


    <h1 class="lg-heading">
      {{ $t('stats') }}
    </h1>
    <div v-if="data && data.groups" class="form-group mt-2 black">
      <label for="groups" class="white">{{$t('groups')}}</label>
      <Multiselect
          id="groups"
          v-model="checkedGroup"
          :groupSelect="false"
          :object="false"
          mode="single"
          valueProp="id"
          :searchable="true"
          :createTag="false"
          :options="data.groups"
          label="name"
          @select="showGroupStats"
          @clear="clearGroupStats"
      />
    </div>
    <template v-if="groupUsers && groupUsers.length">

      <div class="right hdn">
        <button class="printBtn " :title="$t('print')" @click="printEl('groupStatTable')">
          <i class="fas fa-print fa-lg"></i>
        </button>
        <button class="chartBtn " :title="$t('grInform')" @click="showGroupChart">
          <i class="fas fa-chart-bar fa-lg"></i>
        </button>
      </div>

      <div ref="groupStatTable">
        <h2>
          {{ $t('group') }}: {{ checkedGroupName }}
        </h2>
        <TheTable>
          <table class="infoTable mt-1 mb-1">
            <thead>
            <tr class="info">
              <th>№</th>
              <th>{{ $t('test') }}</th>
              <th>{{ $t('level') }}</th>
              <th>{{ $t('dateTime') }}</th>
              <th>{{ $t('score') }}</th>
            </tr>
            </thead>
            <template v-for="user in groupUsers">
              <thead>
              <tr>
                <th colspan="5" class="group">
                  <span class="pointer underline" @click="switchUser(user.uid)">
                    {{ user.name }}
                  </span>
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="(result, i) in user.results">
                <td>{{ i + 1 }}</td>
                <td>
                  <span class="d-block">{{ result.topic }}</span>
                </td>
                <td>
                  <span>{{ result.level }}</span>
                </td>
                <td>
                  {{ $getDate(result.startedAt, 'DD MMM YYYY H:mm') }}
                </td>
                <td>
                  <span>{{ useLocRes(result.result.value) }} / {{ result.result.final }}</span>
                </td>
              </tr>
              </tbody>
            </template>
            <tbody>
            </tbody>
          </table>
        </TheTable>
      </div>
    </template>
    <the-loader v-else-if="checkedGroup" color="white"/>


    <div v-if="data && data.users" class="form-group mt-2 black">
      <label for="users" class="white">{{$t('users')}}</label>
      <Multiselect
          id="users"
          v-model="checkedUser"
          :groupSelect="false"
          :object="false"
          mode="single"
          valueProp="uid"
          :searchable="true"
          :createTag="false"
          :options="data.users"
          label="displayName"
          @select="showUserStats"
          @clear="clearUserStats"
      />
    </div>

    <the-loader v-else color="white"/>


    <template v-if="userStats">
      <component @togglePreload="preloadEmail = !preloadEmail" :checkedUser="checkedUserName" class="d-none" :data="userStats" :is="emailComp"/>
      <div class="hdn btnBox">
        <button class="printBtn " :title="$t('print')" @click="printEl('userStatTable')">
          <i class="fas fa-print fa-lg"></i>
        </button>
        <button class="chartBtn " :title="$t('grInform')" @click="showUserChart">
          <i class="fas fa-chart-bar fa-lg"></i>
        </button>
        <div v-if="preloadEmail" class="fa-1x">
          <i class="fas fa-sync fa-spin"></i>
        </div>
        <button v-else class="emailBtn" :title="$t('send')" @click="sendEmail"><i class="fas fa-at fa-lg"></i></button>

      </div>
      <div ref="userStatTable">
        <h2>
          {{ $t('user') }}: {{ checkedUserName }}
        </h2>
        <TheTable>
          <table class="infoTable mt-1 mb-1">
            <thead>
            <tr class="info">
              <th>№</th>
              <th>{{ $t('test') }}</th>
              <th>{{ $t('dateTime') }}</th>
              <th>{{ $t('score') }}</th>
              <th class="hdn">{{ $t('detail') }}</th>
            </tr>
            </thead>
            <template v-for="(results, groupName) in userStats.results">
              <thead>
              <tr>
                <th :colspan="colspan" class="group">
                  {{ $t('group') }}:
                  <span class="pointer underline" @click="switchGroup(groupName)">
                  {{groupName}}
                  </span>
                </th>
              </tr>
              </thead>
              <template v-for="(value, levelName) in results">
                <thead>
                <tr>
                  <th :colspan="colspan" class="italic underline">{{ levelName }}</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="(result, i) in value">
                  <td>{{ i + 1 }}</td>
                  <td>
                    <span class="d-block">{{ result.topic }}</span>
                    <span class="d-block"><span class="correct">{{ $t('correct') }}:</span>
                  {{ result.correct }}, <span class="incorrect">{{ $t('incorrect') }}:</span> {{
                        result.incorrect
                      }}</span>
                  </td>
                  <td>
                    {{ $getDate(result.startedAt, 'DD MMM YYYY') }}
                    ({{ $t('duration') }}: {{ result.duration }})
                  </td>
                  <td>
                    <span>{{ useLocRes(result.result.value) }} / {{ result.result.final }}</span>
                  </td>
                  <td class="hdn">
                    <button @click="showDetail(result.id)">{{ $t('show') }}</button>
                  </td>
                </tr>
                <tr class="level">
                  <td :colspan="colspan">
                    {{ $t('average') }} {{ getMiddleByLevel(value) }}
                  </td>
                </tr>
                </tbody>
              </template>
            </template>
            <tbody>
            </tbody>
          </table>
        </TheTable>
      </div>
    </template>
    <the-loader v-else-if="checkedUser" color="white"/>


  </main>
</template>

<script setup>
import {ref, defineAsyncComponent, shallowRef, onMounted} from 'vue';
import Multiselect from '@vueform/multiselect';
import {useLocRes} from '../../../composables/useLocRes';
import getMiddleByLevel from "../../../helpers/getMiddleByLevel";

const {$t, $showToast, $getDate, $print, $logOut, $scrollTo} = useNuxtApp();

import {useRouter} from 'vue-router';

const router = useRouter();

const checkedUser = ref(null);
const checkedUserName = ref(null);
const checkedGroup = ref(null);
const checkedGroupName = ref(null);
const groupStatTable = ref(null);
const userStatTable = ref(null);
const groupUsers = ref(null);
const userStats = ref(null);
const userChartStats = ref(null);
const groupChartStats = ref(null);
const colspan = ref(5);
const resToShow = ref(null);
const emailComp = shallowRef(null);
const data = ref(null);
const showModal = ref(false);
const showUserChartModal = ref(false);
const showGroupChartModal = ref(false);
const preloadEmail = ref(false);


definePageMeta({
  layout: 'admin'
})

const title = computed(()=>  $t('dashboard') + ' — ' + $t('stats'))

useMeta({
  title: title
})

function closeModal() {
  showModal.value = false;
  showUserChartModal.value = false;
  showGroupChartModal.value = false;
}

onMounted(async () => {
  data.value = await $fetch('/api/admin/stats');
})

async function showGroupStats() {

  try {
    checkedGroupName.value = data.value.groups.filter((group) => group.id === checkedGroup.value)[0].name;
    groupUsers.value = null;
    const {users} = await $fetch('/api/admin/stats/group',
        {params: {groupId: checkedGroup.value}})

    groupUsers.value = users;
  } catch (e) {

    if (e.response.status === 403) {
      $logOut();
      $showToast($t('access_d'), 'error');

      await router.replace('/404')

    } else {

      $showToast($t('error_auth'), 'error', 2000);

    }
  }
}

function clearGroupStats() {
  groupUsers.value = null;
}

function switchUser(userId) {
  checkedUser.value = userId;
  showUserStats();
  $scrollTo('#users', 800, {offset: -100})
}

function switchGroup(groupName) {
  checkedGroup.value = data.value.groups.filter((group) => group.name === groupName)[0].id;
  showGroupStats();
  $scrollTo('#groups', 800, {offset: -100})
}

async function showUserStats() {
  try {
    emailComp.value = null;
    checkedUserName.value = data.value.users.filter((user) => user.uid === checkedUser.value)[0].displayName;
    userStats.value = null;
    userStats.value = await $fetch('/api/admin/stats/user',
        {params: {userId: checkedUser.value}});

  } catch (e) {

    if (e.response.status === 403) {
      $logOut();
      $showToast($t('access_d'), 'error');

      await router.replace('/404')

    } else {

      $showToast($t('error_auth'), 'error', 2000);

    }
  }
}

async function showUserChart() {
  try {
    userChartStats.value = null;
    showUserChartModal.value = true;

    userChartStats.value = await $fetch('/api/admin/stats/userchart',
        {params: {userId: checkedUser.value}});

  } catch (e) {

    if (e.response.status === 403) {
      $logOut();
      $showToast($t('access_d'), 'error');

      await router.replace('/404')

    } else {

      $showToast($t('error_auth'), 'error', 2000);

    }
  }
}

async function showGroupChart() {

  groupChartStats.value = null;
  showGroupChartModal.value = true;

  groupChartStats.value = await $fetch('/api/admin/stats/groupchart',
      {params: {groupId: checkedGroup.value}});
}

function clearUserStats() {
  userStats.value = null;
  emailComp.value = null;
}

function printEl(table) {

  if (table === 'groupStatTable') {
    $print(groupStatTable.value, false)
  } else {
    $print(userStatTable.value, false)
  }
}

function showDetail(resId) {
  resToShow.value = resId;
  showModal.value = true;
}

async function sendEmail() {
  emailComp.value = defineAsyncComponent(() => import("../../../components/TheEmail"));
}

</script>

<style scoped lang="scss">

table th, table td, table tr {
  text-align: center !important;
  font-weight: bold !important;
  border: solid #dee2e6 1px;
}

th.group {
  background-color: #e9ecef
}

tr.info {
  background-color: #212529;
  color: #fff;
}

tr.level {
  background-color: #bdefc7;
}
</style>