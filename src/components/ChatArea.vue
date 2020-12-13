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
    isCalling: Boolean,
  },
  setup(props, { emit }) {
    const message = reactive<Message>({
      data: '',
    });
    const emitMessage = () => {
      emit('send-message', message);
      message.data = '';
    };
    return { message, emitMessage };
  },
});
</script>

<template>
  <div class="main" v-if="isCalling">
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
        @keyup.enter="emitMessage"
      />
      <button class="send btn btn-blue" @click="emitMessage">send</button>
    </div>
  </div>
  <div v-else>
    <br /><br /><br />
    <center><h4>Please Connect to someone</h4></center>
  </div>
</template>

<style lang="scss" scoped>
.main {
  display: flex;
  flex-direction: column-reverse;
  height: 100%;
  width: 100%;
}
.messages {
  padding: 10px 0;
  margin-bottom: 30px;
  .left,
  .right {
    padding: 5px;
    display: flex;
    width: 100%;
    span {
      background-color: mix(black, cyan, 10%);
      padding: 5px 7px;
      border-radius: 2px;
    }
  }
  .right {
    flex-direction: row-reverse;
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
  .send {
    position: absolute;
    right: 5px;
    bottom: 5px;
  }
}
</style>
