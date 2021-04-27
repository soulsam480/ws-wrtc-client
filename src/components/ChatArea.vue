<script lang="ts">
import { defineComponent, PropType, reactive, toRef, watch } from 'vue';
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
    const messes = toRef(props, 'messages');
    const message = reactive<Message>({
      data: '',
    });
    watch(
      messes,
      (o, n) => {
        const mesContainer = document.getElementById('message') as HTMLElement;
        mesContainer.scrollTop = mesContainer.scrollHeight;
      },
      {
        deep: true,
      },
    );
    const emitMessage = () => {
      emit('send-message', message);
      message.data = '';
      const mesContainer = document.getElementById('message') as HTMLElement;
      mesContainer.scrollTop = mesContainer.scrollHeight;
    };
    return { message, emitMessage };
  },
});
</script>

<template>
  <div v-if="isCalling" class="parent" data-test="msg-parent">
    <div class="messages" id="message" data-test="msg-list">
      <div
        v-for="m in messages"
        :key="m.data"
        :class="m.from === me ? 'right' : 'left'"
        data-test="msg"
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
        data-test="msg-input"
      />
      <button class=" btn btn-blue" @click="emitMessage" data-test="send-msg">
        send
      </button>
    </div>
  </div>
  <div v-else>
    <br /><br /><br />
    <div class="text-center" data-test="not-calling">
      <h4>Please Connect to someone</h4>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.parent {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}
.messages {
  overflow-y: auto;
  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
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
  margin: 5px 0 0 0;

  position: relative;
  display: flex;
  align-items: center;
  .inputbox {
    padding: 10px 5px;
    width: 100%;
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
  .btn-blue {
    position: absolute;
    right: 5px;
  }
}
</style>
