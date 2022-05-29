<template>
  <main id="home" class="withFooter center">
    <h1 class="mt-1">{{$t('dashboard')}}</h1>
    <h3>{{$t('dashboard_welcome')}}</h3>
    <p>
      {{$t('total_tests')}}: <strong>{{data.counts.tasks.count}}</strong>
    </p>
    <p>
      {{$t('total_topics')}}: <strong>{{data.counts.topics.count}}</strong>
      ({{$t('avail_pass')}}: <strong>{{data.counts.topics.avail}}</strong>)
    </p>
    <p>
      {{$t('total_links')}}: <strong>{{data.counts.sources.count}}</strong>
    </p>
    <p>
      {{$t('total_users')}}: <strong>{{data.counts.users.count}}</strong>
    </p>
  </main>
</template>
<script setup>
const {$t} = useNuxtApp();

definePageMeta({
  layout: 'admin'
})

const title = computed(()=>  $t('dashboard'))

useMeta({
  title: title
})

const {data, error} = await useAsyncData('admin', () => $fetch('/api/admin'), {initialCache: false});

</script>

<style lang="scss" scoped>

</style>