<template>
  <main id="home" class="withFooter center">
    <h1 class="lg-heading mb-2">
      {{ $t('welcome') }}
    </h1>

    <button v-if="showIcon" class= "button success">
      <i class="fas fa-sync fa-spin"></i>
    </button>

    <template v-if="!canPass">
      <button @click="canPass = true" class= "button success">
        <span>{{ $t('toTest') }}</span>
      </button>
    </template>

    <template v-else-if="toTest">
      <div class="testInfo">
        <select v-model="group" class=" contact">
          <option value="" disabled selected>{{ $t('yourGroup') }}</option>
          <option v-for="(group, i) in userGroups" :key="i" :value="group.id">{{ group.name }}
          </option>
        </select>
        <select v-model="topic" class="contact">
          <option value="" disabled selected>{{ $t('testTopic') }}</option>
          <option value="0">Study guide</option>
          <option v-for="(topic, i) in userTopics" :key="i" :value="topic.id">{{ topic.name }}
          </option>
        </select>
      </div>
      <button  @click="begin" class= "button success mt-1">
        {{ $t('start') }}
      </button>
    </template>

  </main>
</template>

<script setup>
import {ref, onMounted, watch, computed} from 'vue';
const user = useUserInfo();
const showModal = useSign();
const {$t, $logOut, $showToast} = useNuxtApp();
const  userGroups = ref(null);
const  userTopics = ref(null);
const showIcon = ref(false);
const group = ref('');
const topic = ref('');
const toTest = ref(false);
const canPass = useCanpass();
const router = useRouter();

const title = computed(()=>  $t('sphere') + ' — ' + $t('welcome'))

useMeta({
  title: title
})


onMounted(() => {
  canPass.value = false;
})

watch(canPass, () => {
  if(canPass.value){
    toBegin()
  }else{
    toTest.value = false;
  }
})

async function toBegin(){
  try{

    showIcon.value = true;
    const {groups, topics}  = await $fetch('/api/tobegin');
    userGroups.value = groups;
    userTopics.value = topics;
    toTest.value = true;
    showIcon.value = false;

  }catch (e) {
    $logOut();
    toTest.value = false;
    showModal.value = true;
    showIcon.value = false;
  }
}

function begin(){

  if(!group.value || !topic.value){
    $showToast($t('choose'), 'error');
    return
  }

  const grName = userGroups.value.filter((gr)=> gr.id === group.value)[0].name;

  const tpName = (+topic.value !== 0) ? userTopics.value.filter((tp)=> tp.id === topic.value)[0].name
      : 'Study guide';

  router.push({name: 'test', params: {
      groupId: group.value,
      groupName: grName,
      topicName: tpName,
      topicId: topic.value,
      level: user.value.level
  }});
}

</script>

<style scoped lang="scss">

.testInfo{
  max-width: 400px;
  margin: 0 auto
}

select{
  font-size: 15px;
}
</style>
