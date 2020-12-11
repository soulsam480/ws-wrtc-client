<script lang="ts">
import { defineComponent, PropType, reactive } from 'vue';
import { Message } from '@/utils/models';
export default defineComponent({
  name: 'ChatArea',
  props: {
    messages: {
      type: Object as PropType<Array<Message>>,
      required: true,
    },
    me: String,
  },
  setup() {
    const message = reactive<Message>({
      data: '',
    });

    return { message };
  },
});
</script>

<template>
  <div>
    <div class="messages">
      <div
        v-for="m in messages"
        :key="m.data"
        :class="m.from === me ? 'right' : 'left'"
      >
        <span>
          {{ m.data }}
        </span>
        <br />
      </div>
    </div>
    <div class="type">
      <input
        type="text"
        class="inputbox"
        v-model="message.data"
        @keyup.enter="$emit('send-message', message)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.messages {
  padding: 10px 0;
  .left {
    span {
      background-color: mix(black, cyan, 10%);
    }
  }
  .right {
    float: right;
    span {
      background-color: mix(black, cyan, 15%);
    }
  }
}
.type {
  .inputbox {
    padding: 10px 5px;
    width: 100%;
    position: absolute;
    left: 0;
    bottom: 0;
    border: none;
    outline: none;
    background-color: mix(black, cyan, 10%);
    font-family: 'Yanone Kaffeesatz', sans-serif !important;
    border: none;
    font-size: inherit;
    &::placeholder {
      color: rgb(107, 107, 107);
      font-size: inherit;
    }
  }
}
</style>
