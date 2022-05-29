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
import {ref} from 'vue';

const {$t, $showToast, $logOut} = useNuxtApp();
import {useRouter} from 'vue-router';
const router = useRouter();

const {data, error} = await useAsyncData('adminSources', () => $fetch('/api/admin/sources'));

definePageMeta({
  layout: 'admin'
})

const title = computed(()=>  $t('dashboard') + ' — ' + $t('sources'))

useMeta({
  title: title
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

  try {
    $showToast($t('loading'), 'info', 2000);
    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/sources/edit', {
        method: 'PUT',
        body: sourceToUpdate.value,
      })
      const ind = data.value.sources.findIndex(item => item.id === result.id);
      data.value.sources[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/sources/add', {
        method: 'POST',
        body: sourceToUpdate.value,
      })
      data.value.sources.unshift(result);
    }

    filter(null, null);

    closeModal();

    $showToast($t('info_changed'), 'success', 2000);

  } catch (e) {

    if (e.response.status === 422) {

      $showToast($t(e.response._data.msg), 'error');

    } else if (e.response.status === 403) {

      $showToast($t('access_d'), 'error');
      $logOut();
      await router.replace('/404')

    } else {

      $showToast($t('error_auth'), 'error', 2000);

    }

  }
}

async function removeItem(dbId) {
  if (confirm('Are you sure?')) {
    try {

      $showToast($t('loading'), 'info', 2000);

      const {id} = await $fetch('/api/admin/sources/remove', {
        method: 'DELETE',
        body: {id: dbId},
      })

      data.value.sources.splice(data.value.sources.findIndex(item => item.dbId === id), 1);

      filter(null, null);

      $showToast($t('info_deleted'), 'success', 2000);

    } catch (e) {

      if (e.response.status === 403) {
        $logOut();
        $showToast($t('access_d'), 'error');

        await router.replace('/404')

      }
    }
  }
}

</script>

