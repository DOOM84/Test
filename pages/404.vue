<template>
  <main class="withFooter">
    <h1 class="lg-heading">{{ $t('notFound') }}</h1>
    <h2 class="center">{{ $t('notFoundMsg') }}</h2>
  </main>
</template>

<script setup>

const {$t} = useNuxtApp();

const title = computed(()=>  $t('sphere') + ' — ' + $t('notFound'))

useMeta({
  title: title
})

definePageMeta({
  layout: 'error'
})

</script>


<style scoped>

</style>