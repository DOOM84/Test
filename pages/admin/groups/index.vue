<template>
  <main class="withFooter center">
    <h1 class="lg-heading">
      {{$t('groups')}}
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
        <label for="name">{{$t('title')}}</label>
        <input type="text" v-model.trim="groupToUpdate.name" class="form-control " id="name">
      </div>

      <div class="right">
        <label for="can_pass">{{$t('available')}}</label>
        <input type="checkbox" v-model="groupToUpdate.can_pass" id="can_pass">
      </div>

      <div class="right">
        <label for="status">{{$t('published')}}</label>
        <input type="checkbox" v-model="groupToUpdate.status" id="status">
      </div>

      <button
          type="button"
          class="btn btn-dark"
          @click.prevent="storeItem">
        {{$t('save')}}
      </button>
    </AdminModalWrap>

    <AdminDtable @endFilter="toFilter = false"
                 :data="data.groups"
                 :toFilter="toFilter"
                 :filtering="filtering"
                 :toSearch="['name']">
      <template #thead>
        <table-head>
          <div class="flexCentered">
            <strong>{{$t('title')}}</strong>
            <i @click.self="filter('name', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('name', 'desc')" class="fa fa-caret-down pointer"></i>
          </div>
        </table-head>
        <table-head>
          <div class="flexCentered">
            <strong>{{$t('available')}}</strong>
            <i @click.self="filter('can_pass', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('can_pass', 'desc')" class="fa fa-caret-down pointer"></i>
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
          {{ row.name }}
        </table-body>
        <table-body>
          {{ row.can_pass ? $t('yes') : $t('no') }}
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
  title: t('dashboard') + ' — ' + t('groups')
})

const {data, error} = await useAsyncData('groups', () => $fetch('/api/admin/groups/index'));


const filtering = ref([]);
const toFilter = ref(false);

function filter(fTerm, dir){
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const groupToUpdate = ref({status: false});
const showDlg = ref(false);
const mode = ref(null);

function closeModal() {
  showDlg.value = false;
  mode.value = null;
  groupToUpdate.value = {status: false}
}

function updateItem(group) {
  mode.value = 'edit';
  groupToUpdate.value = {...group}
  showDlg.value = true;
}

function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  groupToUpdate.value.status = false;
}

async function storeItem() {

  const formData = new FormData();
  formData.append('data', JSON.stringify(groupToUpdate.value))
  try {
    $showToast(t('loading'), 'info', 2000);
    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/groups/edit', {
        method: 'POST',
        body: formData,
      })
      const ind = data.value.groups.findIndex(item => item.id === result.id);
      data.value.groups[ind] = result;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/groups/add', {
        method: 'POST',
        body: formData,
      })
      data.value.groups.unshift(result);
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

      const {id} = await $fetch('/api/admin/groups/remove', {
        method: 'POST',
        body: formData,
      })

      data.value.groups.splice(data.value.groups.findIndex(item => item.dbId === id), 1);

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

