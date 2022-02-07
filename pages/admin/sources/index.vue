<template>
  <main class="withFooter center">
    <h1 class="lg-heading">
      {{$t('sources')}}
    </h1>

    <div class="right">
      <button
          type="button"
          @click.prevent="addItem">
        {{$t('add')}}
      </button>
    </div>

    <AdminModalWrap @closeDlg="closeModal" mWidth="1000px" origWidth="100%" :showDlg="showDlg">
      <div class="form-group">
        <label for="url">{{$t('link')}}</label>
        <input type="text" v-model.trim="sourceToUpdate.url" class="form-control " id="url">
      </div>
      <div class="right">
        <label for="status">{{$t('published')}}</label>
        <input type="checkbox" v-model="sourceToUpdate.status" id="status">
      </div>

      <button
          type="button"
          class="btn btn-dark"
          @click.prevent="storeItem">
        {{ $t('save') }}
      </button>
    </AdminModalWrap>

    <AdminDtable v-if="data" @endFilter="toFilter = false"
                 :data="data.sources"
                 :toFilter="toFilter"
                 :filtering="filtering"
                 :toSearch="['url']">
      <template #thead>
        <table-head>
          <div class="flexCentered">
            <strong>{{$t('link')}}</strong>
            <i @click.self="filter('url', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('url', 'desc')" class="fa fa-caret-down pointer"></i>
          </div>
        </table-head>
        <table-head>
          <div class="flexCentered">
            <strong>{{$t('published')}}</strong>
            <i @click.self="filter('status', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('status', 'desc')" class="fa fa-caret-down pointer"></i>
          </div>
        </table-head>
        <table-head/>
      </template>

      <template #rows="{row}">
        <table-body>
          <div class="modalTableWidth">
            <a class="underline" target="_blank" :href="row.url">{{ row.url }}</a>
          </div>
        </table-body>
        <table-body>
          {{ row.status ? $t('yes') : $t('no') }}
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
import {ref, onMounted} from 'vue';

const cached = useCachedinfo();
const {$i18n, $showToast, $logOut} = useNuxtApp();
const  {t} = $i18n().global;
const data = ref(null);
import {useRouter} from 'vue-router';
const router = useRouter();

definePageMeta({
  layout: 'admin'
})

useMeta({
  title: t('dashboard') + ' — ' + t('sources')
})

//const {data, error} = await useAsyncData('sources', () => $fetch('/api/admin/sources/index'));

onMounted(async () => {

  const index = cached.value.findIndex((element) => element['adminSources']);
  if (index !== -1) {

    data.value = {...cached.value[index]['adminSources']}

  } else {

    data.value = await $fetch('/api/admin/sources/index');

    cached.value.push({'adminSources': data.value})
  }

})

const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir){
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const sourceToUpdate = ref({status: false});
const showDlg = ref(false);
const mode = ref(null);

function closeModal() {
  showDlg.value = false;
  mode.value = null;
  sourceToUpdate.value = {status: false}
}

function updateItem(source) {
  mode.value = 'edit';
  sourceToUpdate.value = {...source}
  showDlg.value = true;
}

function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  sourceToUpdate.value.status = false;
}

async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(sourceToUpdate.value))
  try {
    $showToast(t('loading'), 'info', 2000);
    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/sources/edit', {
        method: 'POST',
        body: formData,
      })
      const ind = data.value.sources.findIndex(item => item.id === result.id);
      data.value.sources[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/sources/add', {
        method: 'POST',
        body: formData,
      })
      data.value.sources.unshift(result);
    }
    updateCache();

    filter(null, null);

    closeModal();

    $showToast(t('info_changed'), 'success', 2000);

  } catch (e) {

    if (e.response.status === 422) {

      $showToast(t(e.response._data.msg), 'error');

    } else if (e.response.status === 403) {

      $showToast(t('access_d'), 'error');
      $logOut();
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

      const {id} = await $fetch('/api/admin/sources/remove', {
        method: 'POST',
        body: formData,
      })

      data.value.sources.splice(data.value.sources.findIndex(item => item.dbId === id), 1);

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

function updateCache(){

  const index = cached.value.findIndex((element) => element['adminSources']);
  if (index !== -1) {
    cached.value[index]['adminSources'] = data.value;
  }

  const ind = cached.value.findIndex((element) => element['adminTasks']);
  if (ind !== -1) {
    cached.value.splice(ind, 1);
  }
}

</script>

