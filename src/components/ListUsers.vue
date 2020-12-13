<script lang="ts">
import { defineComponent, toRef, PropType } from 'vue';
import { User } from '@/utils/models';
export default defineComponent({
  props: {
    list: Object as PropType<Array<User>>,
    me: String,
    connectedTo: String,
  },
  emits: ['call-user'],
  setup(props) {
    const userList = toRef(props, 'list');
    return {
      userList,
    };
  },
});
</script>

<template>
  <div class="chat-list">
    <div>
      <h3>Live Users</h3>
      <span
        >me: <u>{{ me }}</u></span
      ><br />
      <span v-if="connectedTo"
        >with:<u>{{ connectedTo }}</u></span
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
