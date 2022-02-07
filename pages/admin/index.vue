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
const {$i18n} = useNuxtApp();
const {t} = $i18n().global;

definePageMeta({
  layout: 'admin'
})

useMeta({
  title: t('dashboard')
})

const {data, error} = await useAsyncData('admin', () => $fetch('/api/admin/index'));

</script>

<style lang="scss" scoped>

</style>