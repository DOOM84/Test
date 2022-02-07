<template>

  <div>
    <div id="modals"></div>
    <AdminModalWrap @closeDlg="closeModal" mWidth="400" :showDlg="showModal">
      <TheAuth/>
    </AdminModalWrap>
    <TheHeader/>
    <slot/>
    <TheFooter/>
  </div>


</template>

<script setup>
const showModal = useSign();

useMeta({
  bodyAttrs: {
    id: 'bg-img'
  }
})

function closeModal() {
  showModal.value = false;
}
</script>