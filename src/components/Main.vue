<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { io } from 'socket.io-client';
import { Socket } from 'socket.io-client/build/socket';
import ListUsers from '@/components/ListUsers.vue';
import { User } from '@/utils/models';
export default defineComponent({
  name: 'Main',
  components: {
    ListUsers,
  },
  setup: () => {
    let socket: Socket;
    const sender = ref('');
    const users = reactive<Array<User>>([]);
    const showLogin = ref(false);
    let isAlreadyCalling = false;
    const userName = ref('');
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
    const call = async (id: any) => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(
        new RTCSessionDescription(offer),
      );
      socket.emit('call-user', {
        offer,
        to: id,
      });
    };
    const Send = () => {
      dc.send(sender.value);
      socket.emit('text-data', {
        text: sender.value,
      });
    };
    const backFired = () => {
      dc.send(sender.value);
      socket.emit('text-data', {
        text: sender.value,
      });
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
          console.log(data);

          if (!users.find((eli) => eli === el)) {
            users.push(el);
          }
        });
      });

      //?====================
      socket.on('remove-user', (data: any) => {
        console.log(`user ${data.socketId} is disconnected.`);
        users.splice(users.indexOf(data.socketId), 1);
      });

      //?-====================================
      socket.on('call-made', async (data: any) => {
        window.alert(`${data.socket} is calling`);
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer),
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(
          new RTCSessionDescription(answer),
        );

        socket.emit('make-answer', {
          answer,
          to: data.socket,
        });
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

      peerConnection.ondatachannel = (e) => {
        rdc = e.channel;
        rdc.onmessage = (e) => {
          sender.value = e.data;
        };
        rdc.onopen = (e) => {
          window.alert('connected');
        };
      };
    });

    return {
      sender,
      users,
      call,
      Send,
      backFired,
      showLogin,
      submit,
      userName,
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
                />
              </div>
              <button class="btn btn-cyan" @click="submit">Submit</button>
            </div>
          </div>
        </div>
      </div>
      <div class="row" v-else>
        <div class="col-sm-4">
          <ListUsers :list="users" />
        </div>
        <div class="col-sm-8">aa</div>
      </div>
      <!-- <div>
        <div v-for="u in users" :key="u">
          <button class="btn" @click="call(u)">{{ u }}</button>
        </div>
      </div>
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
}
.login-form {
  padding: 10px;
}
</style>
