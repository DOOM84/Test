<template>
  <div ref="tableToSend" class="hdn">
    <h1>
      {{$t('stats')}}. {{ checkedUser ? checkedUser : user.name}}
    </h1>
    <table  v-if="data && data.results" style="
    border-collapse: collapse;
    border-spacing: 0;
    width: 100%;
    border: 0.5px solid #ddd;
    margin-top: 1rem;
    margin-bottom: 1rem;"
    >
      <thead>
      <tr style="border: black solid 0.5px;background: white;color: black; text-align: center">
        <th style="padding: 8px;">№</th>
        <th style="padding: 8px;">{{$t('test')}}</th>
        <th style="padding: 8px;">{{$t('dateTime')}}</th>
        <th style="padding: 8px;">{{$t('score')}}</th>
      </tr>
      </thead>
      <template v-for="(results, groupName) in data.results">
        <thead>
        <tr style="border: black solid 0.5px; padding: 8px;background: white;color: black; text-align: center">
          <th colspan="4" style="background-color: #e9ecef; padding: 8px;" >{{$t('group')}}: {{ groupName }}</th>
        </tr>
        </thead>
        <template v-for="(value, levelName) in results">
          <thead>
          <tr style="border: black solid 0.5px; color: black; text-align: center">
            <th colspan="4" style="padding: 8px; text-decoration: underline; font-style: italic">{{ levelName }}</th>
          </tr>
          </thead>
          <tbody>
          <tr style="border: black solid 0.5px;background: white;color: black; text-align: center" v-for="(result, i) in value">
            <td style="padding: 8px; border: black solid 0.5px;">{{ i + 1 }}</td>
            <td style="padding: 8px; border: black solid 0.5px;">
              <span style="display: block">{{ result.topic }}</span>
              <span style="display: block"><span style="color: #346b4c">{{$t('correct')}}:</span>
                  {{ result.correct }}, <span style="color: #F44336;">{{$t('incorrect')}}:</span> {{ result.incorrect }}</span>
            </td>
            <td style="border: black solid 0.5px; padding: 8px;">
              {{ $getDate(result.startedAt, 'DD MMM YYYY') }}
              ({{$t('duration')}}: {{ result.duration }})
            </td>
            <td style="border: black solid 0.5px; padding: 8px;">
              <span>{{ useLocRes(result.result.value) }} / {{ result.result.final }}</span>
            </td>
          </tr>
          <tr style="border: black solid 0.5px;background: white;color: black;text-align: center">
            <td style="border: black solid 0.5px; background-color: #bdefc7; padding: 8px;" colspan="4">
              {{$t('average')}} {{ getMiddleByLevel(value) }}
            </td >
          </tr>
          </tbody>
        </template>
      </template>
      <tbody>
      </tbody>
    </table>
  </div>

</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useLocRes} from "../composables/useLocRes";
import getMiddleByLevel from "../helpers/getMiddleByLevel";
const user = useUserInfo();
const tableToSend = ref(null);
const {$t, $showToast} = useNuxtApp();
const emit = defineEmits(['togglePreload']);

const props = defineProps({
  data: Object,
  checkedUser: {type: String, default: null},
})

async function sendEmail(){

  try {
    emit('togglePreload');
    const res = await $fetch('/api/email', {
      method: 'POST',
      body: {info: tableToSend.value.innerHTML, subject: $t('email_subject')},
    })
    $showToast($t('email_sent'), 'success');
    emit('togglePreload');
  } catch (e) {
    if (e.response.status !== 401) {

      $showToast($t('error_try_later'), 'error');

    } else {

      $showToast($t('error_auth'), 'error');
    }
  }
}

onMounted(()=>{
  sendEmail();
})



</script>

<style lang="scss" scoped>

</style>