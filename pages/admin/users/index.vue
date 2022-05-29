<template>
  <main id="users" class="withFooter center">

    <h1 class="lg-heading">
      {{ $t('users') }}
    </h1>

    <div class="right">
      <button
          type="button"
          @click.prevent="addItem">
        {{ $t('add') }}
      </button>
    </div>

    <AdminModalWrap @closeDlg="closeModal" mWidth="1000px" origWidth="100%" :showDlg="showDlg">
      <div class="form-group">
        <label for="login">{{ $t('userName') }}</label>
        <input type="text" v-model="userToUpdate.displayName" class="form-control " id="login">
      </div>
      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" v-model="userToUpdate.email" class="form-control " id="email">
      </div>
      <div class="form-group mt-2">
        <label for="groups">{{ $t('groups') }}</label>
        <Multiselect
            id="groups"
            v-model="userToUpdate.groups"
            :object="false"
            mode="tags"
            valueProp="id"
            :searchable="true"
            :createTag="false"
            :options="data.groups"
            label="name"
        />
      </div>
      <div class="form-group">
        <label for="attempts">{{ $t('attempts') }}</label>
        <input type="text" v-model="userToUpdate.attempts" class="form-control " id="attempts">
      </div>
      <div class="form-group mt-2">
        <label for="level">{{ $t('level') }}</label>
        <select v-model="userToUpdate.level" class="w100 form-control" id="level">
          <option v-for="(level, i) in data.levels" :key="i" :value="level.id">{{ level.title }}
          </option>
        </select>
      </div>
      <div class="form-group">
        <label for="password">{{ $t('password') }}</label>
        <input type="password" v-model="userToUpdate.password" class="form-control " id="password">
      </div>
      <div class="form-group">
        <label for="password_confirmation">{{ $t('password_more') }}</label>
        <input type="password" v-model="userToUpdate.passwordConfirmation" class="form-control"
               id="password_confirmation">
      </div>
      <div v-if="userToUpdate.customClaims" class="right">
        <label for="role">{{ $t('adm') }}</label>
        <input type="checkbox" v-model="userToUpdate.customClaims.admin" id="role">
      </div>
      <div class="right">
        <label for="status">{{ $t('blocked') }}</label>
        <input type="checkbox" v-model="userToUpdate.disabled" id="status">
      </div>

      <button
          type="button"
          class="btn btn-dark"
          @click.prevent="storeItem">
        {{ $t('save') }}
      </button>
    </AdminModalWrap>

    <AdminDtable @endFilter="toFilter = false"
                 :data="data.users"
                 :toFilter="toFilter"
                 :filtering="filtering"
                 :toSearch="['displayName']">
      <template #thead>
        <table-head>
          <div class="flexCentered">
            <strong>{{ $t('fullName') }}</strong>
            <i @click.self="filter('displayName', 'asc')" class="fa ml-1 fa-caret-up pointer"></i>
            <i @click.self="filter('displayName', 'desc')" class="fa fa-caret-down pointer"></i>
          </div>
        </table-head>
        <table-head>
          <div class="flexCentered">
            <strong>Email</strong>
          </div>
        </table-head>

        <table-head>
          <div class="flexCentered">
            <strong>{{$t('group')}}</strong>
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
            <strong>{{$t('attempts')}}</strong>
          </div>
        </table-head>
        <table-head>
          <div class="flexCentered">
            <strong>{{$t('blocked')}}</strong>
          </div>
        </table-head>
        <table-head>
          <div class="flexCentered">
            <strong>{{$t('adm')}}</strong>
          </div>
        </table-head>
        <table-head/>
      </template>

      <template #rows="{row}">
        <table-body>
          <div class="modalTableWidth">
            {{ row.displayName }}
          </div>
        </table-body>
        <table-body>
          {{ row.email }}
        </table-body>
        <table-body>
          <ul>
            <li v-for="group in row.fullGroups">
              {{ group.name }}
            </li>
          </ul>
        </table-body>
        <table-body>
          {{ row.levelName }}
        </table-body>
        <table-body>
          {{ row.attempts }}
        </table-body>
        <table-body>
          {{ row.disabled ? 'Да' : 'Нет' }}
        </table-body>
        <table-body>
           {{ row.customClaims['admin'] ? 'Да' : 'Нет' }}
        </table-body>
        <table-body>
          <button @click.prevent="updateItem(row)" class="btn-light"><i class="fas fa-edit"></i></button>
          <button @click.prevent="removeItem(row.uid)" class="btn-light"><i class="fas fa-trash"></i></button>
        </table-body>
      </template>
    </AdminDtable>

  </main>
</template>

<script setup>
import {ref} from 'vue';
import Multiselect from '@vueform/multiselect'

const {$t, $showToast, $logOut} = useNuxtApp();
import {useRouter} from 'vue-router';

const router = useRouter();

definePageMeta({
  layout: 'admin'
})

const title = computed(()=>  $t('dashboard') + ' — ' + $t('users'))

useMeta({
  title: title
})

const filtering = ref([]);
const toFilter = ref(false);


function filter(fTerm, dir) {
  filtering.value = [fTerm, dir]
  toFilter.value = true;
}

const {data, error} = await useAsyncData('users', () => $fetch('/api/admin/users'));

const userToUpdate = ref({customClaims: {admin: false}, disabled: false, groups: []});
const showDlg = ref(false);
const mode = ref(null);


function closeModal() {
  showDlg.value = false;
  mode.value = null;
  userToUpdate.value = {customClaims: {admin: false}, disabled: false, groups: []};
}

function updateItem(user) {
  mode.value = 'edit';
  userToUpdate.value = {
    ...user,
  }
  showDlg.value = true;
}

function addItem() {
  mode.value = 'add';
  showDlg.value = true;
  userToUpdate.value.groups = [];
}

async function storeItem() {

  const {levelName, fullGroups, ...updatedRest} = userToUpdate.value;

  try {
    $showToast($t('loading'), 'info', 2000);
    if (mode.value === 'edit') {
      const {result} = await $fetch('/api/admin/users/edit', {
        method: 'PUT',
        body: updatedRest,
      })
      const ind = data.value.users.findIndex(item => item.uid === result.uid);

      userToUpdate.value.fullGroups = data.value.groups
          .filter(group => userToUpdate.value.groups.includes(group.id));

      userToUpdate.value.levelName = data.value.levels.filter(lev => lev.id === result.level)[0].title;
      userToUpdate.value.attempts = result.attempts;

      delete userToUpdate.value.password;
      delete userToUpdate.value.passwordConfirmation;

      data.value.users[ind] = userToUpdate.value;
    }

    if (mode.value === 'add') {
      const {result} = await $fetch('/api/admin/users/add', {
        method: 'POST',
        body: updatedRest,
      })

      userToUpdate.value.fullGroups = data.value.groups
          .filter(group => userToUpdate.value.groups.includes(group.id));

      userToUpdate.value.levelName = data.value.levels.filter(lev => lev.id === result.level)[0].title;

      userToUpdate.value.uid = result.uid;
      userToUpdate.value.attempts = result.attempts;


      delete userToUpdate.value.password;
      delete userToUpdate.value.passwordConfirmation;

      data.value.users.unshift(userToUpdate.value);

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

      $showToast($t('error_email_exists'), 'error', 2000);

    }

  }
}

async function removeItem(userId) {


  if (confirm('Are you sure?')) {

    try {

      $showToast($t('loading'), 'info', 2000);

      const {id} = await $fetch('/api/admin/users/remove', {
        method: 'DELETE',
        body: {id: userId},
      })

      data.value.users.splice(data.value.users.findIndex(item => item.uid === id), 1);

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