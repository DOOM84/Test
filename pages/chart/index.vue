<template>
  <main class="withFooter center">
    <h1 class="lg-heading">
      {{$t('grInform')}}
    </h1>

    <template v-if="data && data.results" v-for="(levels, groupName) in data.results">
      <h2>{{$t('yourGroup')}}: {{ groupName }}</h2>
        <div class="chartBox">
          <div v-for="(results, levelName) in levels">

            <the-chart v-if="results.length > 1" :results="results" type="line" :level="levelName"></the-chart>

            <div v-else class="doughnutChartBox">
              <div class="doughnutChart">
                <the-chart :results="results" type="doughnut" :level="levelName"></the-chart>
              </div>
            </div>
          </div>

        </div>
    </template>

  </main>
</template>

<script setup>
import {useRouter, useRoute} from "vue-router";
import getCookie from "../../helpers/getCookie";
const user = useState('user');
const route = useRoute();
const router = useRouter();
const {$i18n, ssrContext} = useNuxtApp();
const {t} = $i18n().global

let token;

if (ssrContext) {
  token = getCookie(ssrContext.req.headers.cookie, 'token');
}

const {data, error} = await useAsyncData('chart', () => $fetch('/api/chart',
    {params: {token: token}}))

/*if (ssrContext) {
  const {res, url} = ssrContext;
  if (!token) {
    res.writeHead(302, {
      Location: '/'
    });
    res.end();
  }
} else {
  if (error.value) {
    $showToast('Вы не авторизованы', 'error', 2000);
    $logOut();
    router.replace('/404')
  }
}*/

useMeta({
  title: t('sphere') + ' — ' + t('grInform')
})
</script>

<style scoped lang="scss">



</style>
