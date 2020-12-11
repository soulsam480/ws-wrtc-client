<script lang="ts" setup="props">
import { User } from '@/utils/models';
import { toRef } from 'vue';

declare const props: {
  list: Array<User>;
  me: string;
};

declare const emits: ['call-user'];

export const userList = toRef(props, 'list');
</script>

<template>
  <div class="chat-list">
    <div>
      <h3>Live Users</h3>
      <span
        >me: <u>{{ me }}</u></span
      >
    </div>
    <div v-for="u in userList" :key="u.id" @click="$emit('call-user', u.id)">
      <span> {{ u.name }} </span> <br />
      <small> ID: {{ u.id }} </small>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.chat-list {
  padding: 5px 0;
  div {
    display: block;
    padding: 7px;

    &:not(:first-child):hover {
      background-color: mix(black, cyan, 10%);
      cursor: pointer;
    }
  }
}
</style>
