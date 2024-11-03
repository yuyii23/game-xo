<script setup lang="ts">
import { ref, onMounted } from 'vue';

const animContainer = ref<HTMLElement | null>(null);
const water = ref<HTMLElement | null>(null);

function createWater() {
  if (water.value && animContainer.value) {
    const waterElement = water.value;
    waterElement.style.bottom = Math.random() * 550 + 'px';
    waterElement.style.left = Math.random() * 100 + '%';
    const waterClone = waterElement.cloneNode(true) as HTMLElement;
    animContainer.value.appendChild(waterClone);
    setTimeout(() => {
      waterClone.remove();
    }, 20000);
  }
}

onMounted(() => {
  setInterval(createWater, 1000); 
});
</script>

<template>
  <div ref="animContainer" class="water-animation-container">
    <div ref="water" class="water-bubble"></div>
  </div>
</template>

<style scoped>
.water-animation-container {
  position: absolute;
  width: 100%;
  height: 100%;
  
}

.water-bubble {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: rise 20s linear infinite;
}

@keyframes rise {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-1000px);
  }
}
</style>
