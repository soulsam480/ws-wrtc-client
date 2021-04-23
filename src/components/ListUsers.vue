<script lang="ts">
import { defineComponent, toRef, PropType } from 'vue';
import { User } from '@/utils/models';
export default defineComponent({
  props: {
    list: Object as PropType<Array<User>>,
    me: String,
    connectedTo: String,
    showHam: Boolean,
    isMuted: Boolean,
  },
  emits: ['call-user', 'close-side', 'toggle-mute', 'close-call'],
  setup(props) {
    const userList = toRef(props, 'list');
    return {
      userList,
    };
  },
});
</script>

<template>
  <div class="chat-list" :class="{ full: showHam === true }">
    <div>
      <h3>
        Live Users
        <span style="float: right" @click="$emit('close-side')">X</span>
      </h3>
      <button
        class="btn btn-indigo"
        v-if="connectedTo"
        @click="$emit('toggle-mute')"
      >
        {{ isMuted ? 'Unmute' : 'Mute' }}
      </button>
      <button
        style="margin-left:5px"
        class="btn btn-red"
        v-if="connectedTo"
        @click="$emit('close-call')"
      >
        Close
      </button>
      <br />
      <span
        >me: <u>{{ me }}</u></span
      ><br />
      <span v-if="connectedTo"
        >with:<u>{{ connectedTo }}</u></span
      >
    </div>
    <hr />
    <div
      v-for="u in userList"
      :key="u.id"
      :class="{ disableclick: connectedTo === u.name }"
      @click="$emit('call-user', u.id)"
    >
      <span> {{ u.name }} </span>
      <span v-if="connectedTo === u.name" style="float: right;"
        ><small>connected</small></span
      >
      <br />
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
  @media (max-width: 768px) {
    float: right;
    position: absolute;
    top: 0;
    left: 0;
    background-color: mix(black, cyan, 10%);
    width: 200px;
    z-index: 10000;
    height: 400px;
    overflow: visible;
    transition: width 0.6s cubic-bezier(0.5, 1, 0.22, 1);
    -webkit-transition: width 0.6s cubic-bezier(0.5, 1, 0.22, 1);
    display: none;
  }
}
h3 {
  span {
    @media (min-width: 768px) {
      display: none;
    }
  }
}
.full {
  display: block !important;
}
.disableclick {
  pointer-events: none;
}
</style>
v-if="connectedTo"
