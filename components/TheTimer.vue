<template>
  <div class="timer">
    {{showZeroForMin + min +':' + showZeroForSec + sec}}
  </div>
</template>

<script setup>

import moment from 'moment/min/moment-with-locales.js';
import {ref, onMounted, computed, onBeforeUnmount} from 'vue';
import getRandom from "@/helpers/getRandom";
const {$showToast} = useNuxtApp();
const min = ref(50);
const sec = ref(0);
const timer = ref(null);

const msgs = {
  goodLuck: ['Break a leg!', 'Good Luck'],
  stillHere: ['Shake a leg!', 'Are you still here?'],
}

const props = defineProps({
  answers: Number,
  started: Boolean,
})

const emit = defineEmits(['finished']);

const showZeroForMin = computed(
    () => min.value < 10 ? '0' : ''
)

const showZeroForSec = computed(
    () => sec.value < 10 ? '0' : ''
)

onMounted(()=>{

  if(props.started){
    showMsg(msgs.goodLuck, 'success');
  }

  const currentTime = moment().unix();
  const eventTime = currentTime + (60 * 50);
  const diffTime = eventTime - currentTime;
  let duration = moment.duration(diffTime * 1000, 'milliseconds');
  const interval = 1000;

  timer.value = setInterval(() => {
    duration = moment.duration(duration - interval, 'milliseconds');
    min.value = duration.minutes();
    sec.value = duration.seconds();

    if(min.value === 47 && sec.value === 0 && !props.answers){showMsg(msgs.stillHere, 'info');}

    if(min.value === 0 && sec.value === 0){
      clearInterval(timer.value);
      emit('finished')
    }
  }, interval);
})


function showMsg (msgArr, type = 'success') {
  $showToast(msgArr[getRandom(msgArr.length - 1, 0)] , type, 5000)
}

onBeforeUnmount(()=>{
  clearInterval(timer.value);
})
</script>

<style lang="scss" scoped>

</style>