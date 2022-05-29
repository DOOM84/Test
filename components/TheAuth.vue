<template>
  <div>
      <h3>{{ showMode }}</h3>
      <div class="mt-1">

      <template v-if="mode==='signup' || mode==='login'">
        <input @keyup.enter="authorize" v-if="mode==='signup'" class="contact" v-model.trim="login" type="text"
               name="login" :placeholder="$t('name')">
        <input @keyup.enter="authorize" class="contact" v-model.trim="email" type="email"
               name="email" :placeholder="$t('email')">

        <select v-if="mode==='signup'" v-model="group" class="contact">
          <option value="" disabled selected>Ваша группа</option>
          <option v-for="(group, i) in avGroups" :key="i" :value="group.id">{{ group.name }}
          </option>
        </select>

        <input @keyup.enter="authorize" class="contact" v-model.trim="password" type="password"
               name="password" :placeholder="$t('password')">

        <template v-if="mode==='signup'">
          <input @keyup.enter="authorize" class="contact" v-model.trim="passwordConfirmation" type="password"
                 name="passwordConfirmation"
                 :placeholder="$t('password_more')">
        </template>

        <div class="mt-1">
          <button class="loginBtn" :disabled="showIcon" @click="authorize">
            <i v-if="showIcon" class="fas fa-sync fa-spin"></i>
            <span v-else>{{ showMode }}</span>
          </button>
          <button class="loginBtn" @click="toggleMode(null)">{{ showBtnMode }}</button>
          <button class="loginBtn" @click="toggleMode('reset')">{{ $t('forgot') }}</button>
        </div>
      </template>

      <template v-else>
        <input @keyup.enter="authorize" class="contact" v-model.trim="email" type="email"
               name="email" :placeholder="$t('email')">
        <div class="mt-1">
          <button class="loginBtn" :disabled="showIcon" @click="authorize">
            <i v-if="showIcon" class="fas fa-sync fa-spin"></i>
            <span v-else>{{ $t('send') }}</span>
          </button>
          <button class="loginBtn" @click="toggleMode('login')">{{ $t('login') }}</button>
        </div>
      </template>
      </div>
  </div>
</template>
<script setup>

import {computed, ref, onMounted} from 'vue';

const authToken = useTokenAuth();
const isLoggedIn = useIsloggedIn();
const user = useUserInfo();
const {$t, $showToast, $logOut} = useNuxtApp();
//const {t} = $i18n().global;
const login = ref('');
const email = ref('');
const group = ref('');
const password = ref('');
const passwordConfirmation = ref('');
const mode = ref('login');
const err = ref(false);
const showIcon = ref(false);
const showModal = useSign();
const sideLogin = useSidelogin();
const canPass = useCanpass();
const nextPlace = useNextplace();
const avGroups = useGroups();

onMounted(async () => {
  if(!avGroups.value){
    const {groups}  = await $fetch('/api/groups');
    avGroups.value = groups;
  }
})

const showMode = computed(() =>
    mode.value === 'signup' ? $t('register') : mode.value === 'login' ? $t('login') : $t('resetPas'));

const showBtnMode = computed(() => mode.value === 'signup' ? $t('login') : $t('register'));

function setCookies(name, data) {
  let now = new Date();
  now.setTime(now.getTime() + 1 * 3600 * 1000);
  let expires = "expires=" + now.toUTCString();
  document.cookie = name + "=" + data + ";" + expires + ";path=/; SameSite=Lax;";
}

function toggleMode(reset = null) {
  if (reset) {
    mode.value = reset
  } else {
    mode.value = mode.value === 'login' ? 'signup' : 'login'
  }
}

function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

async function authorize() {

  if (isLoggedIn.value) {
    return
  }
  err.value = false;

  if (!validateEmail(email.value)) {
    err.value = true;
    $showToast($t('error_email'), 'error');
  }

  if (mode.value !== 'reset') {
    if (password.value.length < 6) {
      err.value = true;
      $showToast($t('error_pass_length'), 'error');
    }
  }

  if (mode.value === 'signup') {
    let strippedLogin = login.value.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>{}\[\]\\\/]/gi, '')


    if (!strippedLogin || strippedLogin !== login.value || strippedLogin.length < 3) {
      err.value = true;
      $showToast($t('error_login'), 'error');
    }

    if (!group.value) {
      err.value = true;
      $showToast($t('error_group'), 'error');
    }

    if (password.value !== passwordConfirmation.value) {
      err.value = true;
      $showToast($t('error_pass_match'), 'error');
    }
  }

  if (err.value) {
    return
  }

  const info = {email: email.value}

  if (mode.value !== 'reset') {
    //formData.append("password", password.value);
    info.password = password.value
  }

  if (mode.value === 'signup') {
    info.login = login.value;
    info.group = group.value;
    info.passwordConfirmation = passwordConfirmation.value;
  }

  try {
    showIcon.value = true
    const data = mode.value === 'signup' ? await $fetch('/api/auth/signup', {
      method: 'POST',
      body: info,
    }) : mode.value === 'login' ?
        await $fetch('/api/auth/login', {
          method: 'POST',
          body: info,
        }) : await $fetch('/api/auth/reset', {
          method: 'POST',
          body: info,
        })

    if (mode.value !== 'reset') {
      setCookies('token', data.token);
      authToken.value = data.token;
      isLoggedIn.value = !!data.token;
      user.value = {
        name: data.login,
        level: data.level,
        //id: data.id
      }

      showModal.value = false;

      const origRoute = nextPlace.value;

      nextPlace.value = null;

      if(origRoute){
        const router = useRouter();
        router.push(origRoute)
        return
      }
      if(!sideLogin.value){canPass.value = true;}


    } else {
      showIcon.value = false;
      $showToast($t('email_sent'), 'success');
      mode.value = 'login';
    }
  } catch (error) {
    canPass.value = false;
    showIcon.value = false;
    err.value = true;
    $logOut();

    if (mode.value === 'signup') {

      if (error.response.status !== 422) {

        $showToast($t('error_email_exists'), 'error');

      } else {

        $showToast($t(error.response.data.msg), 'error');
      }
    } else {

      if (error.response.status !== 422) {

        $showToast($t('error_no_user'), 'error');

      } else {

        $showToast($t(error.response.data.msg), 'error');
      }

    }
  }

}

</script>

<style lang="scss" scoped>

.loginBtn {
  cursor: pointer;
  width: 100%;
  border: none;
  background: #4CAF50;
  color: #FFF;
  margin: 0 0 5px;
  padding: 10px;
  font-size: 15px;
}

</style>