<template>
  <main class="withFooter center">
    <AdminModalWrap @closeDlg="closeModal" mWidth="100%" :showDlg="showDetails">
      <TheDetail :resId="resultId" />
    </AdminModalWrap>
    <h1 class="lg-heading">
      {{$t('test')}}: {{ $route.params.topicName }}. {{$t('level')}}: {{ $route.params.level }}.
    </h1>
    <template v-if="countedRes">
      <h1 class="lg-heading">{{$t('result')}} <span class="italic">
        {{ countedRes.value }} / {{ countedRes.result }}
      </span></h1>
      <button @click="getDetail" class="mt-1 button success">{{$t('detail')}}</button>
    </template>

    <template v-else>
      <div class="infoBox">
        <ClientOnly>
          <the-player></the-player>
        </ClientOnly>

        <the-colors @setColor="changeCol"></the-colors>

      </div>

      <the-timer :started="started" :answers="uniqueKeys.length" @finished="finished"></the-timer>

      <div class="checked">
        <i class="fas fa-check"></i> {{ uniqueKeys.length }}
      </div>

      <div class="left mt-2" v-if="data && data.tasks">

        <div class="taskBox" v-for="(task, i) in data.tasks" key="i"
             :style="{ backgroundColor: curColor, color: textColor}"
        >
          <p class="testText">
            {{ i + 1 }}. {{ task.text }}
          </p>
          <template v-if="task.type === 'input'">
            <div class="form-group mt-1">
              <input v-model="inputs[task.id]" type="text" class="form-control ">
            </div>
          </template>
          <template v-else>
          <div v-for="(answer, i) in task.answers">
              <input @change="answered" type="checkbox"
                     :id="answer.id"
                     :value="{[task.id] : answer.id}"
                     v-model="results">
              <label :for="answer.id"> {{ answer.body }}</label>
          </div>
          </template>
        </div>
      </div>

      <button @click.prevent="toResults" class="btn btn-dark success resBtn">
        {{$t('send')}}
      </button>

    </template>

  </main>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter, useRoute} from "vue-router";

const cached = useCachedinfo();
const route = useRoute();
const router = useRouter();
const user = useState('user');
const showDetails = useDetail();
const {$i18n, ssrContext, $showToast, $logOut, $getDate} = useNuxtApp();
const {t} = $i18n().global;
const showModal = useSign();
const results = ref([]);
const inputs = ref({});
const started = ref(false);
const startedAt = ref(0);
const resultId = ref(null);
const finalRes = ref([]);
const uniqueKeys = ref([]);
const timerOff = ref(false);
const countedRes = ref(null);
const showPlayer = ref(false);
const curColor = ref('transparent');
const textColor = ref('#fff');
const terms = ref([3, 4, 5, 7, 10, 18, 20, 23, 24, 25, 27, 30, 38, 40, 49]);

if (ssrContext) {
  const {res, url} = ssrContext;
  res.writeHead(302, {
    Location: '/'
  });
  res.end();
}

const {data, error} = await useAsyncData('test', () => $fetch('/api/test',
    {params: {topicId: route.params.topicId}}));

if(process.client){
  if (error.value) {
    if(error.value.response.status === 403){
      $showToast(t('attemptsExc'), 'error', 5000);
    }else{
      $showToast(t('error_auth'), 'error', 2000);
      $logOut();
    }
    router.replace('/404')
  }else{
    started.value = true;
    startedAt.value = Date.now();
  }
}

function finished() {
  timerOff.value = true;
  getResults();
}

function changeCol(color) {
  curColor.value = color;
  if (color === 'transparent') {
    textColor.value = '#fff';
  } else {
    textColor.value = '#000';
  }
}

function answered() {

  if (timerOff.value) {
    $showToast(t('expired'), 'error', 5000);
    return
  }

  let keys = results.value.map((res) => {
    return Object.keys(res)[0]
  }).filter(v => v);

  uniqueKeys.value = [...new Set(keys)];

  finalRes.value = uniqueKeys.value.map(key => {
    const resArr = [];
    results.value.forEach((ob) => {

      let k = Object.keys(ob)[0];

      if (k === key) {
        resArr.push(ob[key]);
      }
    })
    return {[key]: resArr};
  })

  if (terms.value.includes(uniqueKeys.value.length)) {
    getMessage()
    terms.value = terms.value.filter((term) => term !== uniqueKeys.value.length)
  }
}

function toResults() {
  if (confirm('Are you sure?')) {
    getResults();
  }
}

async function getResults() {
  try {

    const formData = new FormData();
    formData.append('data', JSON.stringify({
      userId: data.value.userId,
      topicId: route.params.topicId,
      groupId: route.params.groupId,
      uniqueKeys: uniqueKeys.value,
      finalRes: finalRes.value,
      inputs: inputs.value,
      startedAt: startedAt.value,
      duration: $getDate((Date.now() - startedAt.value), 'mm:ss')
    }));

    const {finalResults, level, addedID} = await $fetch('/api/result', {
      method: 'POST',
      body: formData,
    })

    const index = cached.value.findIndex( (element) => element[addedID]);

    if(index !== -1){
      cached.value.splice(index, 1);
    }

    countedRes.value = finalResults;

    user.value.level = level;

    resultId.value = addedID;

  } catch (e) {
    if (e.response.status === 401) {
      $logOut();
      showModal.value = true;
    }

    if (e.response.status === 403) {
      $logOut();
      showModal.value = true;
      $showToast(t('userCanNotPass'), 'error', 5000);
    }
  }
}

async function getMessage() {

  try {

    const formData = new FormData();
    formData.append('data', JSON.stringify({
      userId: data.value.userId,
      uniqueKeys: uniqueKeys.value, finalRes: finalRes.value
    }));

    const {phrase} = await $fetch('/api/message', {
      method: 'POST',
      body: formData,
    })

    if (phrase !== null) {
      $showToast(phrase.msg, phrase.type, 5000);
    }

  } catch (e) {

    if (e.response.status === 401) {
      $logOut();
      showModal.value = true;
    }

    if (e.response.status === 403) {
      $logOut();
      showModal.value = true;
      $showToast(t('userCanNotPass'), 'error', 5000);
    }

  }
}

function closeModal() {
  showDetails.value = false;
}

function getDetail() {

  showDetails.value = true;
}

useMeta({
  title: t('sphere') + ' — ' + t('test')
})

</script>

<style lang="scss">
.infoBox {
  display: flex;
  flex-direction: column;
}

.taskBox{
  border-radius:5px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: all 0.5s ease-out;
}

.resBtn {
  width: 100%;
  margin: 1rem 0;
  padding: 1rem;
  color: white
}

</style>
