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
const {$t} = useNuxtApp();

const {data, error} = await useAsyncData('chart', () => $fetch('/api/chart',
    {headers: useRequestHeaders(["cookie"])}), {initialCache: false})

const title = computed(()=>  $t('sphere') + ' — ' + $t('grInform'))

useMeta({
  title: title
})
</script>

<style scoped lang="scss">



</style>
