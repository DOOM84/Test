<template>
  <div>
    <div id="modals"></div>
    <AdminTheHeader/>
    <slot/>
    <LazyTheFooter />
  </div>

</template>

<script setup>
useMeta({
  bodyAttrs: {
    id: 'bg-img'
  }
})
</script>