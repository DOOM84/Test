<template>
  <main class="withFooter center">
    <h1 class="lg-heading">
      {{ $t('tests') }}
    </h1>

    <div class="right">
      <button
          type="button"
          @click.prevent="addItem">
        {{$t('add')}}
      </button>
    </div>

    <AdminModalWrap @closeDlg="closeModal" mWidth="1000px" origWidth="100%" :showDlg="showDlg">
      <div v-if="mode === 'add'" class="form-group">
      <div class="center">
        <label for="taskMode">{{$t('input')}}</label>
        <input type="checkbox" v-model="inputAnswer" id="taskMode">
      </div>
      </div>

      <div class="form-group">
        <label for="name">{{$t('quest')}}</label>
        <input type="text" v-model.trim="taskToUpdate.text" class="form-control " id="name">
      </div>

      <template v-if="inputAnswer || taskToUpdate.type === 'input'">
        <div class="form-group mt-2">
          <label for="inputAnswer">{{$t('answer')}}</label>
          <input type="text" v-model="taskToUpdate.answer" class="form-control " id="inputAnswer">
        </div>
      </template>
      <template v-else>
        <div class="right">
          <button
              type="button"
              class="btn-dark"
              @click.prevent="pushToAnswers">
            {{$t('add_answer')}}
          </button>
        </div>

        <template v-for="answer in taskToUpdate.answers">
          <div class="form-group mt-2">
            <label for="description">{{$t('answer')}}</label>
            <input type="text" v-model.trim="answer.body" class="form-control " id="description">
            <div class="left">
              <label :for="'correct'+answer.id">{{$t('correct_ans')}}</label>
              <input type="checkbox" v-model="answer.correct" :id="'correct'+answer.id">
            </div>
          </div>
        </template>
      </template>

      <div class="form-group mt-2">
        <label for="level">{{$t('level')}}</label>
        <select v-model="taskToUpdate.level" class="w100 form-control" id="level">
          <option v-for="(level, i) in data.levels" :key="i" :value="level.id">{{ level.title }}
          </option>
        </select>
      </div>

      <div class="form-group mt-2">
        <label for="topics">{{$t('topics')}}</label>
        <Multiselect
            id="topics"
            v-model="taskToUpdate.topicsIds"
            :object="false"
            mode="tags"
            valueProp="id"
            :searchable="true"
            :createTag="false"
            :options="sortedTopics"
            label="name"
        />
      </div>
      <div class="form-group mt-2">
        <label for="sources">{{$t('sources')}}</label>
        <Multiselect
            id="sources"
            v-model="taskToUpdate.sourcesIds"
            :object="false"
            mode="tags"
            valueProp="id"
            :searchable="true"
            :createTag="false"
            :options="sortedSources"
            label="url"
        />
      </div>

      <button
          type="button"
          class="btn btn-dark"
          @click.prevent="storeItem">
        {{$t('save')}}
      </button>
    </AdminModalWrap>

      <AdminDtable v-if="data" @endFilter="toFilter = false"
                   :data="data.tasks"
                   :toFilter="toFilter"
                   :filtering="filtering"
                   :toSearch="['text']">
        <template #thead>
          <table-head>
            <div class="flexCentered">
              <strong>{{$t('test')}}</strong>
              <i @click.self="filter('text', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
              <i @click.self="filter('text', 'desc')" class="fa fa-caret-down pointer"></i>
            </div>
          </table-head>
          <table-head>
            <div class="flexCentered">
              <strong>{{$t('level')}}</strong>
              <i @click.self="filter('levelName', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
              <i @click.self="filter('levelName', 'desc')" class="fa fa-caret-down pointer"></i>
            </div>
          </table-head>
          <table-head>
            <div class="flexCentered">
              <strong>{{$t('testTopic')}}</strong>
            </div>
          </table-head>
          <table-head/>
        </template>

        <template #rows="{row}">
          <table-body>
            <div class="modalTableWidth">
              {{ row.text }}
            </div>
          </table-body>
          <table-body>
            {{ row.levelName }}
          </table-body>
          <table-body>
            <ul>
              <li v-for="topic in row.topics">
                {{ topic.name }}
              </li>
            </ul>
          </table-body>
          <table-body>
            <button @click.prevent="updateItem(row)" class="btn-light"><i class="fas fa-edit"></i></button>
            <button @click.prevent="removeItem(row.dbId)" class="btn-light"><i class="fas fa-trash"></i></button>
          </table-body>
        </template>
      </AdminDtable>
    <TheLoader color="white" v-else></TheLoader>
  </main>
</template>
<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import Multiselect from '@vueform/multiselect'

const cached = useCachedinfo();
const {$i18n, $showToast, $logOut} = useNuxtApp();
const {t} = $i18n().global;
import {useRouter} from 'vue-router';
const inputAnswer = ref(false);

const router = useRouter();

definePageMeta({
  layout: 'admin'
})

useMeta({
  title: t('dashboard') + ' — ' + t('tests')
})

//const {data, error} = await useAsyncData('tasks', () => $fetch('/api/admin/tasks/index'));
const data = ref(null);
const filtering = ref([]);
const toFilter = ref(false);


function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const taskToUpdate = ref({//status: false,
  answers: [], topics: [], sources: [], topicsIds: [], sourcesIds: []
});
const showDlg = ref(false);
const mode = ref(null);


onMounted(async () => {

  const index = cached.value.findIndex((element) => element['adminTasks']);
  if (index !== -1) {

    data.value = {...cached.value[index]['adminTasks']}

  } else {

    data.value = await $fetch('/api/admin/tasks/index');
    cached.value.push({'adminTasks': data.value})
  }

})


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  taskToUpdate.value = {//status: false,
    answers: [], topics: [], sources: [], topicsIds: [], sourcesIds: []
  }
}

const sortedTopics = computed(
    () => data.value.topics.sort((a, b) => a['name'].localeCompare(b['name']))
)
const sortedSources = computed(
    () => data.value.sources.sort((a, b) => a['url'].localeCompare(b['url']))
)

function updateItem(task) {
  mode.value = 'edit';
  taskToUpdate.value = {
    ...task,
    topicsIds: task.topics.map(topic => topic.id),
    sourcesIds: task.sources.map(source => source.id)
  }
  showDlg.value = true;
}

function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  //taskToUpdate.value.status = false;
  taskToUpdate.value.answers = [];
  taskToUpdate.value.topicsIds = [];
  taskToUpdate.value.sourcesIds = [];
}

function pushToAnswers() {
  const answers = [...taskToUpdate.value.answers]

  answers.push({
    id: Date.now() + (+Math.random().toFixed()),
    //status: 1,
    body: '',
    //task_id: taskToUpdate.value.id,
    correct: false
  });

  taskToUpdate.value.answers = answers;
}

async function storeItem() {

  const {sources, levelName, topics, sourcesIds, topicsIds, ...updatedRest} = taskToUpdate.value;
  updatedRest.sources = sourcesIds;
  updatedRest.topics = topicsIds;

  if(inputAnswer.value || updatedRest.type === 'input'){
    delete updatedRest.answers;
    updatedRest.type = 'input'
  }else{
    delete updatedRest.answer;
    delete updatedRest.type;
  }


  const formData = new FormData();
  formData.append('data', JSON.stringify(updatedRest))
  try {
    $showToast(t('loading'), 'info', 2000);
    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/tasks/edit', {
        method: 'POST',
        body: formData,
      })
      const ind = data.value.tasks.findIndex(item => item.dbId === result.dbId);

      taskToUpdate.value.topics = data.value.topics.filter(topic => topicsIds.includes(topic.id));

      taskToUpdate.value.sources = data.value.sources.filter(source => sourcesIds.includes(source.id));

      taskToUpdate.value.levelName = data.value.levels.filter(lev => lev.id === result.level)[0].title;

      data.value.tasks[ind] = taskToUpdate.value;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/tasks/add', {
        method: 'POST',
        body: formData,
      })

      taskToUpdate.value.topics = data.value.topics.filter(topic => topicsIds.includes(topic.id));

      taskToUpdate.value.sources = data.value.sources.filter(source => sourcesIds.includes(source.id));

      taskToUpdate.value.levelName = data.value.levels.filter(lev => lev.id === result.level)[0].title;

      taskToUpdate.value.dbId = result.dbId;

      taskToUpdate.value.type = result.type;

      data.value.tasks.unshift(taskToUpdate.value);

    }

    updateCache();

    filter(null, null);

    closeModal();

    $showToast(t('info_changed'), 'success', 2000);

  } catch (e) {

    if (e.response.status === 422) {

      $showToast(t(e.response._data.msg), 'error');

    } else if (e.response.status === 403) {
      $logOut();
      $showToast(t('access_d'), 'error');

      await router.replace('/404')

    } else {

      $showToast(t('error_auth'), 'error', 2000);

    }

  }
}

async function removeItem(dbId) {

  if (confirm('Are you sure?')) {
    try {

      const formData = new FormData();
      formData.append('id', dbId);

      $showToast(t('loading'), 'info', 2000);

      const {id} = await $fetch('/api/admin/tasks/remove', {
        method: 'POST',
        body: formData,
      })

      data.value.tasks.splice(data.value.tasks.findIndex(item => item.dbId === id), 1);

      updateCache();

      filter(null, null);


      $showToast(t('info_deleted'), 'success', 2000);

    } catch (e) {

      if (e.response.status === 403) {
        $logOut();
        $showToast(t('access_d'), 'error');

        await router.replace('/404')

      }
    }
  }
}

function updateCache() {

  const index = cached.value.findIndex((element) => element['adminTasks']);
  if (index !== -1) {
    cached.value[index]['adminTasks'].tasks = data.value.tasks;
  }
}

</script>

