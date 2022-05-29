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
    <span  class="loginbtn m-1" @click.prevent="logOut">
      <i :title="$t('logOut')" class="fas fa-lg fa-sign-out-alt pointer"></i>
    </span>
    <span class="closebtn m-1" @click.prevent="closeNav">
      <i class="fas fa-lg  fa-times pointer"></i>
    </span>

    <h4 class="center userData" v-if="user"> {{ user?.name }}</h4>

    <ul class="list-items">
      <li>
        <NuxtLink to="/admin"><i class="fas fa-toolbox"></i>{{$t('management')}}</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/topics"><i class="fas fa-edit"></i>{{$t('topics')}}</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/tasks"><i class="far fa-file-alt"></i>{{$t('tests')}}</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/sources"><i class="fas fa-link"></i>{{$t('links')}}</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/levels"><i class="fas fa-level-up-alt"></i>{{$t('levels')}}</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/groups"><i class="fas fa-layer-group"></i>{{$t('groups')}}</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/stats"><i class="fas fa-chart-bar"></i> {{ $t('stats') }}</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/admin/users"><i class="fas fa-users"></i>{{$t('users')}}</NuxtLink>
      </li>
      <li>
        <NuxtLink to="/"><i class="fas fa-home"></i>{{$t('home')}}</NuxtLink>
      </li>
    </ul>

  </div>
</template>

<script setup>

import {ref, watch} from 'vue';

import {useRoute, useRouter} from 'vue-router';

const route = useRoute();

const router = useRouter();

const showOverlay = ref(false);

const loc = useState('locale');

const {$setGloc, $t, $logOut} = useNuxtApp();

const isLoggedIn = useIsloggedIn();

const user = useUserInfo();

const sideNav = ref(null);
const overlay = ref(null);


function setLocale(name, data) {
  $setGloc(data);
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


function logOut() {
  closeNav();
  $logOut();
  router.replace('/');
}

watch(route, () => {
  closeNav();
})

</script>

<style lang="scss" scoped>
.list-items {
  padding: 0;
  margin: 0;
  position: relative;
  //background: #404040;
  width: 100%;
  height: 100%;
  list-style: none;

  li {
    padding-left: 10px;
    line-height: 50px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid #333;
    transition: all 0.3s ease;


    &:first-child {
      border-top: none;
    }

    a {
      color: #f2f2f2;
      text-decoration: none;
      font-size: 18px;
      font-weight: 500;
      height: 100%;
      width: 100%;
      display: block;

      i {
        margin-right: 20px;
      }
    }
  }

  .icons {
    width: 100%;
    height: 40px;
    text-align: center;
    position: absolute;
    bottom: 100px;
    line-height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;

    a {
      height: 100%;
      width: 40px;
      display: block;
      margin: 0 5px;
      font-size: 18px;
      color: #f2f2f2;
      background: #4a4a4a;
      border-radius: 5px;
      border: 1px solid #383838;
      transition: all 0.3s ease;

      &:first-child {
        margin-left: 0;
      }

      &:hover {
        background: #404040;
      }
    }
  }
}

.sidenav {

  li{
    &:hover {
      background: #404040;
    }
  }

  overflow: hidden;

  @media screen and (max-height: 800px) {
    overflow: scroll;
  }

}

</style>