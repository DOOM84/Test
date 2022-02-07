<template>
  <div>
    <div id="modals"></div>
    <AdminModalWrap @closeDlg="closeModal" mWidth="400px" :showDlg="showModal">
      <TheAuth/>
    </AdminModalWrap>
    <TheHeader/>
    <slot/>
    <LazyTheFooter />
  </div>

</template>

<script setup>
const showModal = useSign();
const nextPlace = useNextplace();

useMeta({
  bodyAttrs: {
    id: 'bg-img'
  }
})

function closeModal() {
  nextPlace.value = false;
  showModal.value = false;
}
</script>

<style lang="scss">

</style>