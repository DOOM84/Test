<template>
  <div>
    <i @click="exportChart" :title="$t('download')+ ' PNG'" class="fas fa-download pointer downloadBtn"></i>
    <ClientOnly>
    <vue3-chart-js :id="results[0].startedAt"
                   ref="chartRef"
                   :type="type"
                   :data="this[type].data"
                   :options="this[type].options"
                   :plugins="type === 'line' ? [GradientBgPlugin]: []"
    ></vue3-chart-js>
    </ClientOnly>
  </div>


</template>

<script setup>
import {ref, watch, onBeforeUnmount} from "vue";

const {$i18n, $getDate} = useNuxtApp();
const {t} = $i18n().global;

const props = defineProps({
  results: Object,
  level: String,
  type: String,
})

const chartRef = ref(null);

const line = ref({});

const doughnut = ref({});

const loc = useState('locale');

watch(loc, () => {
  updateChart()
})

onBeforeUnmount(()=>{
  chartRef.value.destroy();
})

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

doughnut.value = {
    options: {
      plugins: {
        title: {
          display: true,
          text: t('level')+': ' + props.level + '. '+t('test')+': ' + props.results[0].topic + ' (' + $getDate(props.results[0].startedAt, 'DD MMM YYYY HH:mm') + ')'
        }
      }
    },
    data: {
      labels: [t('score'), t('max')],
      datasets: [{
        //label: 'My First Dataset',
        data: [props.results[0].result, 100 - (+props.results[0].result)],
        backgroundColor: ['#9bbc5b',
          '#3a6d7a'
        ], hoverOffset: 4
      }]
    }
  }

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
              return t('date')+': ' + $getDate(props.results.filter(res => res.topic === context[0].label)[0].startedAt, 'DD MMM YYYY HH:mm')
            },
            label: function (context) {
              return t('score')+': ' + props.results.filter(res => res.topic === context.label)[0].result
            },
          }
        },
        title: {
          display: true,
          text: t('level')+': ' + props.level
        },
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
      labels: props.results.map((res) => res.topic),
      datasets: [{
        label: props.level,
        data: props.results.map((res) => res.result),
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
    text: t('level')+': ' + props.level,
    display: true
  }
  line.value.options.scales.y.title= {
    display: true,
    text: t('perf')
  }

  doughnut.value.options.plugins.title = {
    text: t('level')+': ' + props.level + '. ' + t('test') + ': ' + props.results[0].topic + ' (' + $getDate(props.results[0].startedAt, 'DD MMM YYYY HH:mm') + ')',
    display: true
  }

  doughnut.value.data.labels= [t('score'), t('max')];

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
  a.download = 'test-'+$getDate(props.results[0].startedAt, 'DD-MMM-YYYY-HH-mm')+'.png';
  a.click();

}



</script>