<template>
  <header ref="mainHead" class="headerMain">
    <div @click="openNav">
      <i class="fas fa-bars fa-lg pointer openNav"></i>
    </div>

    <div class="lang-btn">
      <div @click="setLocale('loc', 'ua')">ua</div>
      <div @click="setLocale('loc', 'en')">en</div>
      <div @click="setLocale('loc', 'ru')">ru</div>
    </div>
  </header>

    <div @click="closeNav" ref="overlay" id="overlay" class="bg"></div>

  <div ref="sideNav" class="sidenav">
    <span  class="closebtn m-1" @click.prevent="closeNav">
      <i class="fas fa-lg  fa-times pointer"></i>
    </span>


    <ClientOnly>
      <template v-if="isLoggedIn">
    <span  class="loginbtn m-1" @click.prevent="logOut">
      <i class="fas fa-lg fa-sign-out-alt pointer"></i>
    </span>
        <h4 class="center userData" v-if="user"> {{ user?.name }} ({{ user?.level }}) </h4>
      </template>

      <template v-else>
      <span class="loginbtn m-1" @click.prevent="showSignIn">
      <i class="fas fa-lg fa-sign-in-alt pointer"></i>
    </span>
      </template>
    </ClientOnly>

    <div>
      <NuxtLink to="/">{{$t('home')}}</NuxtLink>
      <NuxtLink to="/stats"> {{$t('stats')}}</NuxtLink>
      <NuxtLink to="/chart"> {{$t('grInform')}}</NuxtLink>
    </div>

  </div>
</template>

<script setup>

import {ref, watch} from 'vue';

import {useRoute} from 'vue-router';

const route = useRoute();

const showOverlay = ref(false);

const loc = useState('locale');

const showModal = useSign();

const sideLogin = useSidelogin();

const {$i18n, $logOut} = useNuxtApp();
const  {t} = $i18n().global

const isLoggedIn = useState('isLoggedIn');

const user = useState('user');

const sideNav = ref(null);
const overlay = ref(null);



function setLocale(name, data) {
  $i18n().global.locale = data;
  loc.value = data;
  let now = new Date();
  now.setTime(now.getTime() + 1 * 3600 * 1000 * 24 * 30);
  let expires = "expires=" + now.toUTCString();
  document.cookie = name + "=" + data + ";" + expires + ";path=/; SameSite=Lax;";
}

function openNav() {
  showOverlay.value = true;
  sideNav.value.style.left = "0px";
  overlay.value.style.visibility = "visible";
  overlay.value.style.opacity = "0.5";

}

function closeNav() {
  showOverlay.value = false;
  sideNav.value.style.left = "-250px";
  overlay.value.style.opacity = "0";
  overlay.value.style.visibility = "hidden";

}

function showSignIn(){
  closeNav();
  sideLogin.value = true;
  showModal.value = true;
}

function logOut() {
  closeNav();
  $logOut();
}

watch(route, () => {
  closeNav();
})

</script>

<style lang="scss" scoped>

</style>