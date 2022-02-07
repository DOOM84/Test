<template>
  <div class="colorsBox">
    <div
        @click="setCol(color.name)"
        :style="{ backgroundColor: color.name}"
        v-for="color in colors" class="chColor pointer">
    </div>
  </div>
</template>

<script setup>

const colors = [
  {name: 'rgb(202, 199, 216)'},
  {name: 'rgb(217, 227, 203)'},
  {name: 'rgb(163, 192, 144)'},
  {name: 'rgb(213, 229, 215)'},
  {name: 'rgb(206, 223, 144)'},
  {name: 'rgb(215, 205, 196)'},
  {name: 'rgb(255, 255, 255)'},
  {name: 'transparent'},
]

const emit = defineEmits(['setColor']);

function setCol(color) {
  emit('setColor', color)
}


</script>

<style lang="scss">

.colorsBox{
  display: flex;
  justify-content: center;
}

.chColor{
  align-self: center;
  margin: 0 0.2rem;
  width: 20px;
  height: 20px;
  border: 0.5px solid black;
;
}

</style>