<template>
  <main class="withFooter center">
    <h1 class="lg-heading">
      {{$t('levels')}}
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
        <label for="title">{{$t('title')}}</label>
        <input type="text" v-model.trim="levelToUpdate.title" class="form-control " id="title">
      </div>
      <div class="form-group">
        <label for="description">{{$t('descr')}}</label>
        <input type="text" v-model.trim="levelToUpdate.description" class="form-control " id="description">
      </div>
      <button
          type="button"
          class="btn btn-dark"
          @click.prevent="storeItem">
        {{$t('save')}}
      </button>
    </AdminModalWrap>

    <AdminDtable @endFilter="toFilter = false"
                 :data="data.levels"
                 :toFilter="toFilter"
                 :filtering="filtering"
                 :toSearch="['title', 'description']">
      <template #thead>
        <table-head>
          <div class="flexCentered">
            <strong>{{$t('title')}}</strong>
            <i @click.self="filter('title', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('title', 'desc')" class="fa fa-caret-down pointer"></i>
          </div>
        </table-head>
        <table-head>
          <div class="flexCentered">
            <strong>{{$t('descr')}}</strong>
            <i @click.self="filter('description', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('description', 'desc')" class="fa fa-caret-down pointer"></i>
          </div>
        </table-head>
        <table-head/>
      </template>

      <template #rows="{row}">
        <table-body>
          {{ row.title }}
        </table-body>
        <table-body>
          {{ row.description }}
        </table-body>
        <table-body>
          <button @click.prevent="updateItem(row)" class="btn-light"><i class="fas fa-edit"></i></button>
          <button @click.prevent="removeItem(row.dbId)" class="btn-light"><i class="fas fa-trash"></i></button>
        </table-body>
      </template>
    </AdminDtable>
  </main>
</template>
<script setup>
import {ref} from 'vue';

const {$i18n, $showToast, $logOut} = useNuxtApp();
const  {t} = $i18n().global;
import {useRouter} from 'vue-router';
const router = useRouter();

definePageMeta({
  layout: 'admin'
})

useMeta({
  title: t('dashboard') + ' — ' + t('levels')
})

const {data, error} = await useAsyncData('levels', () => $fetch('/api/admin/levels/index'));

const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir){
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const levelToUpdate = ref({status: false});
const showDlg = ref(false);
const mode = ref(null);

function closeModal() {
  showDlg.value = false;
  mode.value = null;
  levelToUpdate.value = {status: false}
}

function updateItem(level) {
  mode.value = 'edit';
  levelToUpdate.value = {...level}
  showDlg.value = true;
}

function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  levelToUpdate.value.status = false;
}

async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(levelToUpdate.value))
  try {
    $showToast(t('loading'), 'info', 2000);
    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/levels/edit', {
        method: 'POST',
        body: formData,
      })
      const ind = data.value.levels.findIndex(item => item.id === result.id);
      data.value.levels[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/levels/add', {
        method: 'POST',
        body: formData,
      })
      data.value.levels.unshift(result);
    }

    filter(null, null);

    closeModal();

    $showToast(t('info_changed'), 'success', 2000);

  } catch (e) {

    if (e.response.status === 422) {

      $showToast(t(e.response._data.msg), 'error');

    } else if (e.response.status === 403) {

      $showToast(t('access_d'), 'error');
      $logOut();
      await router.replace('/404');

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

      const {id} = await $fetch('/api/admin/levels/remove', {
        method: 'POST',
        body: formData,
      })

      data.value.levels.splice(data.value.levels.findIndex(item => item.dbId === id), 1);

      filter(null, null);

      $showToast(t('info_deleted'), 'success', 2000);

    } catch (e) {

      if (e.response.status === 403) {

        $showToast(t('access_d'), 'error');
        $logOut();
        await router.replace('/404')

      }
    }
  }
}

</script>

