<template>
  <div>
    <div v-if="data">
      <div>
        <h1 class="center">
          {{$t('test')}}: {{data.topic}}, {{$t('level')}}: {{data.level}}
        </h1>
      </div>

      <TheTable>
        <table class="infoTable mt-1 mb-1">
          <thead>
          <tr>
            <th>№</th>
            <th>{{$t('quest')}}</th>
            <th>{{$t('variants')}}</th>
            <th>{{$t('userTip')}}</th>
            <th>{{$t('testTopic')}}</th>
            <th>{{$t('sources')}}</th>
          </tr>
          </thead>
          <tbody>
          <tr :class="setColor((task.answers && task.answers.length) ? task.answers : task.answer, task.userAnswers, task.type || null) ? 'correctBg' : 'incorrectBg'" v-for="(task, i) in data.tasks">
            <td>{{ i+1 }}</td>
            <td>
              {{ task.text}}
            </td>
            <td>
              <div class="bold italic" v-if="task.type && task.type === 'input'">
                {{task.answer}}
              </div>
              <ul v-else>
                <li v-for="answer in task.answers" :class="answer.correct ? 'bold italic': '' ">
                  {{ answer.body }}
                </li>
              </ul>
            </td>
            <td>
              <div v-if="task.type && task.type === 'input'">
                {{task.userAnswers}}
              </div>
              <ul v-else>
                <li v-for="answer in task.userAnswers">
                  {{ task.answers.filter((answ)=> answ.id === answer)[0].body }}
                </li>
              </ul>
            </td>
            <td>
              <ul>
                <li v-for="topic in task.topics">
                  {{ topic.name }}
                </li>
              </ul>
            </td>
            <td>
              <ul>
                <li class="sources" v-for="(source, i) in task.sources">
                  <a target="_blank" :href="source.url">{{$t('source')}}{{i+1}}</a>
                </li>
              </ul>

            </td>
          </tr>
          </tbody>
        </table>
      </TheTable>
    </div>
    <the-loader v-else />
  </div>


</template>

<script setup>
import {onMounted, ref} from 'vue';
const cached = useCachedinfo();
const {$t, $logOut, $showToast} = useNuxtApp();
const router = useRouter();

const data = ref(null)

const props = defineProps({
  resId: String,
})

onMounted(async () => {

  const index = cached.value.findIndex( (element) => element[props.resId]);

  if(index !== -1){
    data.value = cached.value[index][props.resId]
  }else{
    try {
      data.value  = await $fetch('/api/detail', {params: {resId: props.resId}});
      cached.value.push({[props.resId]: data.value})
    }catch (e) {
      if(e.response.status === 401){
        $showToast($t('error_auth'), 'error');
        $logOut();
        router.replace('/')
      }
    }

  }

  })

function setColor(answers, userAnswers, type){

  if(type && type === 'input'){
    return answers.trim().toLowerCase() === userAnswers.trim().toLowerCase()
  }

  const correctAnswers = answers.filter((answer)=>answer.correct === true).map((answ)=>answ.id)

  if(userAnswers.length !== correctAnswers.length){
    return false;
  }
  return userAnswers.every( ua => correctAnswers.includes(ua) );

}


</script>

<style scoped lang="scss">

.correct{
  background: #98e1b7 !important;
}
.incorrect{
  background: #f4b0af !important;
}

table th {
  text-align: center !important;
}

</style>