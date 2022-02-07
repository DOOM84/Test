<template>
  <div>
    <div style="display: flex; justify-content: center; gap: 10px; align-items: center">
      <div class="form-group mt-2">
<!--        <label for="from">{{ $t('date') }}</label>-->
        <select @change="setDates" v-model="fromDate" class="form-control" style="max-width: 300px" id="from">
          <option v-for="(date, i) in dates" :key="i" :value="date">{{ $getDate(date, 'DD MMM YYYY') }}
          </option>
        </select>
      </div>
      <div class="form-group mt-2">
<!--        <label for="to">{{ $t('date') }}</label>-->
        <select @change="setDates" v-model="toDate" class="form-control" style="max-width: 300px" id="to">
          <option v-for="(date, i) in dates" :key="i" :value="date">{{ $getDate(date, 'DD MMM YYYY') }}
          </option>
        </select>
      </div>
      <button @click="clearFilter" class="btn-light mb-1"  style="align-self: flex-end;">{{ $t('reset') }}</button>
    </div>


    <i @click="exportChart" :title="$t('download')+ ' PNG'" class="fas fa-download pointer downloadBtn"></i>
    <vue3-chart-js :id="results[0].startedAt"
                   ref="chartRef"
                   :type="type"
                   :data="line.data"
                   :options="line.options"
                   :plugins="[GradientBgPlugin]"
    ></vue3-chart-js>
  </div>


</template>

<script setup>
import {ref, onMounted, computed, onBeforeUnmount} from "vue";

const {$i18n, $getDate, $startDay, $endDay} = useNuxtApp();
const {t} = $i18n().global;
//const dates = ref([]);
const fromDate = ref(0);
const toDate = ref(0);

const props = defineProps({
  results: Object,
  //level: String,
  type: String,
  group: {type: String, default: ''}
})

const chartRef = ref(null);


const filtered = ref([]);

const line = ref({});

filtered.value.push(...props.results);

onBeforeUnmount(()=>{
  chartRef.value.destroy();
})

const dates = computed(
    () => [...new Set( props.results.map((res) => res.startedAt).map((date) => +$startDay(date)))]
)

function setDates(){

  if(fromDate.value === 0 && toDate.value === 0){
    filtered.value = [...props.results];
  }else{
    if(fromDate.value > toDate.value){
      toDate.value = fromDate.value
    }
    if(fromDate.value > 0 && toDate.value <= 0){
      toDate.value = fromDate.value
    }

    if(toDate.value > 0 && fromDate.value <= 0){
      fromDate.value = toDate.value
    }

    filtered.value = props.results.filter(res =>
        res.startedAt >= fromDate.value && res.startedAt <= $endDay(toDate.value));
  }

  line.value.data.labels = filtered.value.map((r) => r.user + ' (' + $getDate(r.startedAt, 'DD MMM YYYY HH:mm') +')');

  line.value.data.datasets[0].data = filtered.value.map(r => r.result.final);

  chartRef.value.update(250)
}


function clearFilter(){
  fromDate.value = 0;
  toDate.value = 0;
  setDates();
}

const GradientBgPlugin = {
  beforeDraw: function(chart, args, options) {
    const ctx = chart.ctx;
    const canvas = chart.canvas;
    const chartArea = chart.chartArea;
    // Chart background
    let gradientBack = canvas.getContext("2d").createLinearGradient(0, 0, 0, 250);
    gradientBack.addColorStop(0, "rgba(60, 174, 163, 0.4)");
    gradientBack.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    gradientBack.addColorStop(1, "rgba(32, 99, 155, 0.1)");

    ctx.fillStyle = gradientBack;
    ctx.fillRect(chartArea.left, chartArea.bottom,
        chartArea.right - chartArea.left, chartArea.top - chartArea.bottom);
  }
};

line.value =  {
  id: 'line',
    //type: 'line',
  options: {
      /*layout: {
        padding: {
          top: 200
        }
      },*/
      plugins: {
        tooltip: {
          //enabled: false,
          displayColors: false,
          mode: 'index',
          intersect: false,
          callbacks: {
            title: function (context) {
              //console.log(filtered.value.length);
              //if(filtered.value.length > 0){
                return t('test')+': ' + filtered.value[context[0].dataIndex].topic + ' (' + filtered.value[context[0].dataIndex].level + ')'
             // }
             // return t('test')+': ' + props.results[context[0].dataIndex].topic + ' (' + props.results[context[0].dataIndex].level + ')'
            },
            label: function (context) {

             // if(filtered.value.length > 0){
                return t('score')+': ' + filtered.value[context.dataIndex].result.final
             // }
             // return t('score')+': ' + props.results[context.dataIndex].result.final
            },
          }
        },
        /*title: {
          display: true,
          text: t('level')+': ' + props.level
        },*/
        legend: {
          display: false,
          labels: {
            //color: 'white'
          }
        }
      },
      hover: {
        mode: 'index',
        intersec: false
      },
      scales: {
        x: {
          title: {
            display: false,
            text: t('test')
          }
        },
        y: {
          title: {
            display: true,
            text: t('perf')
          },
          min: 0,
          max: 100,
          ticks: {
            // forces step size to be 50 units
            stepSize: 5,
          }
        },
      }
    },

  data: {
      labels: filtered.value.map((res) => res.user + ' (' + $getDate(res.startedAt, 'DD MMM YYYY HH:mm') +')'),
      datasets: [{
        //label: props.level,
        data: filtered.value.map((res) => res.result.final),
        backgroundColor: [
          'rgba(54, 162, 235, 0.2)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 5,
      }]
    },
  //plugins: [GradientBgPlugin],
  }


function updateChart() {

  line.value.options.plugins.title = {
    text: t('level')+': ', //+ props.level,
    display: true
  }
  line.value.options.scales.y.title= {
    display: true,
    text: t('perf')
  }

  chartRef.value.update(250)
}

const exportChart = () => {
  let canvas = document.getElementById(props.results[0].startedAt);

  let context = canvas.getContext('2d');

//cache height and width
  let w = canvas.width;
  let h = canvas.height;

  let data = context.getImageData(0, 0, w, h);

  let compositeOperation = context.globalCompositeOperation;

  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#fff";
  context.fillRect(0,0,w,h);

  let imageData = canvas.toDataURL("image/png");

  context.clearRect (0,0,w,h);
  context.putImageData(data, 0,0);
  context.globalCompositeOperation = compositeOperation;
  let a = document.createElement('a');
  a.href = imageData;
  a.download = 'group-'+props.group.replace(/\s+/g, '')+'-'+$getDate(Date.now(), 'DD-MMM-YYYY-HH-mm')+'.png';
  a.click();

}


</script>
