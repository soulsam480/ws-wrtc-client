<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client/build/socket';
import ListUsers from '@/components/ListUsers.vue';
import ChatArea from '@/components/ChatArea.vue';
import { Message, User } from '@/utils/models';
export default defineComponent({
  name: 'Main',
  components: {
    ListUsers,
    ChatArea,
  },
  setup: () => {
    let socket: Socket;
    const users = reactive<Array<User>>([]);
    const showLogin = ref(false);
    let isAlreadyCalling = false;
    const userName = ref('');
    const messages = reactive<Array<Message>>([]);
    const submit = () => {
      socket.emit('add-user', {
        name: userName.value,
      });
      showLogin.value = !showLogin.value;
    };
    const wsUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://soulsam480-node-ws-wrtc.glitch.me'
        : 'http://localhost:3000';
    //todo rtc
    const { RTCPeerConnection, RTCSessionDescription } = window;
    const config = {
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302'],
        },
      ],
    };

    const peerConnection = new RTCPeerConnection(config);
    const dc = peerConnection.createDataChannel('chanel');
    let rdc: RTCDataChannel;

    //todo methods
    //todo call an user
    const call = async (id: any) => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(
        new RTCSessionDescription(offer),
      );
      socket.emit('call-user', {
        offer,
        user: {
          name: userName.value,
          id: socket.id,
        },
        to: id,
      });
      console.log(socket.id);
    };
    //todo send message on rtc
    const send = (val: Message) => {
      (val.at = new Date().toISOString()), (val.from = userName.value);
      messages.push(val);
      dc.send(JSON.stringify(val));
    };

    //todo add rtc
    onMounted(() => {
      //todo main socket connection
      socket = io(wsUrl, {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        showLogin.value = !showLogin.value;
      });

      //?=====================
      socket.on('update-user-list', (data: any) => {
        data.users.forEach((el: any) => {
          if (!users.find((eli) => eli.id === el.id)) {
            users.push(el);
          }
        });
      });

      //?====================
      socket.on('remove-user', (data: any) => {
        console.log(`user ${data.socketId} is disconnected.`);
        users.splice(
          users.findIndex((el) => el.id === data.socketId),
          1,
        );
      });

      //?-====================================
      socket.on('call-made', async (data: any) => {
        const res = confirm(`${data.user.name} is calling! accept ?`);

        if (res) {
          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.offer),
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(
            new RTCSessionDescription(answer),
          );
          socket.emit('make-answer', {
            answer,
            to: data.user.id,
          });
        }
      });

      //?==============================

      socket.on('answer-made', async (data: any) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
        if (!isAlreadyCalling) {
          call(data.socket);
          isAlreadyCalling = true;
        }
      });
    });
    //?=============Peer data tranfer manager==================
    peerConnection.ondatachannel = (e) => {
      rdc = e.channel;

      rdc.onopen = () => {
        window.alert('connected');
      };

      rdc.onmessage = (e) => {
        console.log(e.data);
        messages.push(JSON.parse(e.data));
        console.log(messages);
      };
    };
    return {
      users,
      call,
      send,
      showLogin,
      submit,
      userName,
      messages,
    };
  },
});
</script>

<template>
  <div>
    <center>
      <h1>WS RTC client</h1>
    </center>
    <div class="container c-lg">
      <div v-if="showLogin">
        <div class="row center-xs center-md">
          <div class="col-sm-6">
            <div class="login-form">
              <div class="form-group">
                <label for="test">Name</label>
                <input
                  type="text"
                  class="input"
                  name="test"
                  placeholder="Your name for chat"
                  v-model="userName"
                  @keyup.enter="submit"
                />
              </div>
              <button class="btn btn-cyan" @click="submit">Submit</button>
            </div>
          </div>
        </div>
      </div>
      <div class="row" v-else>
        <div class="col-sm-3 sidebar">
          <ListUsers :list="users" :me="userName" @call-user="call($event)" />
        </div>
        <div class="col-sm-9">
          <ChatArea @send-message="send($event)" :messages="messages" :me="userName" />
        </div>
      </div>
      <!-- <div>

      <div class="row">
        <div class="col-sm-6 col-md-6 col-xs-12">
          <p>From sender</p>
          <textarea
            name="sender"
            v-model="sender"
            cols="30"
            rows="10"
            @input="Send"
            @keyup.backSpace="backFired"
            @keyup.delete="backFired"
          ></textarea>
        </div>
      </div> -->
    </div>
  </div></template
>

<style lang="scss" scoped>
.container {
  border-radius: 5px;
  box-shadow: 0 0.1px 5px 0.5px rgb(211, 211, 211);
  background-color: mix(white, cyan, 40%);
  height: 500px;
  .row {
    height: 100%;
    .col-sm-9 {
      position: relative;
    }
  }
}
.login-form {
  padding: 10px;
}
.sidebar {
  padding: 0;
  border-right: 1px solid rgb(209, 209, 209);
}
</style>
