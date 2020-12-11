<script lang="ts" setup="props">
import { User } from '@/utils/models';
import { toRef } from 'vue';

declare const props: {
  list: Array<User>;
};

export const userList = toRef(props, 'list');
</script>

<template>
  <div class="chat-list">
    <div v-for="u in userList" :key="u.id">
      <span> {{ u.name }} </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-list {
  padding: 10px;
}
</style>
