<template>
  <div>
  <i v-if="!playerOn" @click.prevent.self="togglePlayer(true)" class="fa-2x fas fa-play pointer mt-1 mb-1"></i>
  <div ref="player" class="playerBox">
    <i @click.prevent.self="togglePlayer(false)" class="fa-sm fas fa-times pointer closeBtn"></i>
    <vue-plyr>
      <audio @ended="replay" autoplay>
        <source :src="sounds[getRandom(sounds.length - 1, 0)]" type="audio/mp3"/>
      </audio>
    </vue-plyr>
  </div>
  </div>
</template>

<script setup>

import {ref} from 'vue';
import getRandom from "@/helpers/getRandom";

const player = ref(null);
const playerOn = ref(true);

const sounds = ref([

      'https://test.aim2.top/music/Moon.mp3',
      'https://test.aim2.top/music/dyunah.mp3',
      'https://test.aim2.top/music/mazurka1.mp3',
      'https://test.aim2.top/music/bis.mp3',
      'https://test.aim2.top/music/mazurka2.mp3',
      'https://test.aim2.top/music/preludia1.mp3',
      'https://test.aim2.top/music/preludia2.mp3',
      'https://test.aim2.top/music/preludia4.mp3',
      'https://test.aim2.top/music/preludia5.mp3'
    ]
)

function togglePlayer(sw) {
  if (sw) {
    player.value.style.display = 'block';
    playerOn.value = true;
  } else {
    player.value.style.display = 'none';
    playerOn.value = false;
  }

}

function replay(event) {
  event.target.pause();
  event.target.src = sounds.value[getRandom(sounds.value.length - 1, 0)];
  event.target.play();
}

</script>

<style lang="scss" scoped>

.playerBox {
  max-width: 400px;
  margin: 1rem auto;
  display: block;
  position: relative;

  .closeBtn {
    color: black;
    position: absolute;
    top: 0;
    right: 0.1rem;
    z-index: 1000000000
  }
}
</style>