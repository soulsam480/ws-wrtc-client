<template>
  <Main />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Main from './components/Main.vue';

export default defineComponent({
  name: 'App',
  components: {
    Main,
  },
});
</script>

<style lang="scss">
@import url('~shoyo/dist/main.css');
@import '@/styles/app.scss';
</style>
