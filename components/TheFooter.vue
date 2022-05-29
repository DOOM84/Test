<template>
  <footer id="main-footer">
    © {{ $t('site_name') }} 2.0. {{ new Date().getFullYear() }} | {{ $t('contact') }} <a target="_blank" class="underline" href="https://designs.network"> {{ $t('admin') }}</a>
  </footer>
</template>

<script setup>
const {$t} = useNuxtApp();
</script>

