<template>
  <main ref="statTable" class="withFooter center">
    <AdminModalWrap @closeDlg="closeModal" mWidth="100%" :showDlg="showModal">
      <TheDetail :resId="resToShow"/>
    </AdminModalWrap>
    <h1 class="lg-heading">
      {{ $t('stats') }}. {{ user.name }}
    </h1>
    <div class="hdn btnBox">
      <button class="printBtn " :title="$t('print')" @click="printEl"><i class="fas fa-print fa-lg"></i>
      </button>
      <div v-if="preloadEmail" class="fa-1x">
        <i class="fas fa-sync fa-spin"></i>
      </div>
      <button v-else class="emailBtn" :title="$t('send')" @click="sendEmail"><i class="fas fa-at fa-lg"></i></button>
    </div>

    <component @togglePreload="preloadEmail = !preloadEmail" class="d-none" :data="data" :is="emailComp"/>

    <TheTable>
      <table v-if="data && data.results" class="infoTable mt-1 mb-1">
        <thead>
        <tr class="info">
          <th>№</th>
          <th>{{$t('test')}}</th>
          <th>{{$t('dateTime')}}</th>
          <th>{{$t('score')}}</th>
          <th class="hdn">{{$t('detail')}}</th>
        </tr>
        </thead>
        <template v-for="(results, groupName) in data.results">
          <thead>
          <tr>
            <th :colspan="colspan" class="group">{{$t('group')}}: {{ groupName }}</th>
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
                <span class="d-block"><span class="correct">{{$t('correct')}}:</span>
                  {{ result.correct }}, <span class="incorrect">{{$t('incorrect')}}:</span> {{ result.incorrect }}</span>
              </td>
              <td>
                {{ $getDate(result.startedAt, 'DD MMM YYYY') }}
                ({{$t('duration')}}: {{ result.duration }})
              </td>
              <td>
                <span>{{ useLocRes(result.result.value) }} / {{ result.result.final }}</span>
              </td>
              <td class="hdn">
                <button @click="showDetail(result.id)">{{$t('show')}}</button>
              </td>
            </tr>
            <tr class="level">
              <td :colspan="colspan">
                {{$t('average')}} {{ getMiddleByLevel(value) }}
              </td>
            </tr>
            </tbody>
          </template>
        </template>
        <tbody>
        </tbody>
      </table>
    </TheTable>
  </main>
</template>

<script setup>
import {ref, defineAsyncComponent, shallowRef} from 'vue';
import {useRouter, useRoute} from "vue-router";
import getCookie from "../../helpers/getCookie";
import {useLocRes} from "../../composables/useLocRes";
import getMiddleByLevel from "../../helpers/getMiddleByLevel";

const user = useState('user');
const showModal = useDetail();
const route = useRoute();
const router = useRouter();
const resToShow = ref(null);
const statTable = ref(null);
const colspan = ref(5);
const preloadEmail = ref(false);
const emailComp = shallowRef(null);
const {$i18n, ssrContext, $showToast, $logOut, $getDate, $print} = useNuxtApp();
const {t} = $i18n().global;

useMeta({
  title: t('sphere') + ' — ' + t('stats')
})

let token;

if (ssrContext) {
  token = getCookie(ssrContext.req.headers.cookie, 'token');
}

const {data, error} = await useAsyncData('stats', () => $fetch('/api/stats',
    {params: {token: token}}))

function showDetail(resId) {
  resToShow.value = resId;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
}

function printEl() {

  colspan.value = 4;
  const status = $print(statTable.value, false)
  if (status) {
    colspan.value = 5;
  }
}

async function sendEmail() {
  emailComp.value = defineAsyncComponent(() => import("../../components/TheEmail"));
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