<script setup>
const version = import.meta.env.VITE_VERSION;
</script>

<template>
  <p class="text-version">v. {{ version }}</p>
</template>