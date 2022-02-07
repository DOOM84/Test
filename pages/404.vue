<template>
  <main class="withFooter">
    <h1 class="lg-heading">{{ $t('notFound') }}</h1>
    <h2 class="center">{{ $t('notFoundMsg') }}</h2>
  </main>
</template>

<script setup>
const {$i18n} = useNuxtApp();
const {t} = $i18n().global;

useMeta({
  title: t('sphere') + ' — ' + t('notFound')
})

definePageMeta({
  layout: 'error'
})

</script>


<style scoped>

</style>