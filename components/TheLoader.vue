<template>
  <div class="center" :class="`${color} ${size}`">
    <i class="fas fa-sync fa-spin"></i>
  </div>
</template>

<script setup>

const props = defineProps({
  color: {type: String, default: 'black'},
  size: {type: String, default: 'fa-3x'},
})

</script>

<style lang="scss" scoped>

</style>