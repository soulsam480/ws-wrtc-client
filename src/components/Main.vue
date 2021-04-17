<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, onMounted, reactive, ref } from 'vue';
import { io } from 'socket.io-client';
import ListUsers from '@/components/ListUsers.vue';
import ChatArea from '@/components/ChatArea.vue';
import { Message, User } from '@/utils/models';
export default defineComponent({
  name: 'Main',
  components: {
    ListUsers,
    ChatArea,
  },
  setup() {
    const wsUrl = 'https://soulsam480-node-ws-wrtc.glitch.me';
    /*       process.env.NODE_ENV === 'production'
        ? 'https://soulsam480-node-ws-wrtc.glitch.me'
        : 'http://localhost:3000'; */
    let rdc: RTCDataChannel;
    const config = {
      iceServers: [
        {
          urls: ['stun:stun.l.google.com:19302'],
        },
      ],
    };
    const { RTCPeerConnection, RTCSessionDescription } = window;
    const peerConnection = new RTCPeerConnection(config);
    const dc = peerConnection.createDataChannel('chanel');
    const socket = io(wsUrl, {
      transports: ['websocket'],
    });

    //?====================================================

    const users = reactive<Array<User>>([]);
    const showLogin = ref(true);
    const isAlreadyCalling = ref(false);
    const showHam = ref(false);
    const userName = ref('');
    const remoteUser = ref('');
    const isConnected = ref(false);
    const messages = reactive<Array<Message>>([]);
    const submit = () => {
      socket.emit('add-user', {
        name: userName.value,
      });
      showLogin.value = !showLogin.value;
    };

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
    };
    //todo send message on rtc
    const send = (val: Message) => {
      (val.at = new Date().toISOString()), (val.from = userName.value);
      messages.push({ ...val });
      dc.send(JSON.stringify(val));
    };

    //todo add rtc
    onMounted(() => {
      socket.on('connect', () => {
        isConnected.value = true;
      });
      //todo main socket connection
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
            user: {
              name: userName.value,
              id: socket.id,
            },
          });
          remoteUser.value = data.user.name;
          isAlreadyCalling.value = true;
        }
      });

      //?==============================

      socket.on('answer-made', async (data: any) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer),
        );
        if (!isAlreadyCalling.value) {
          call(data.socket);
          remoteUser.value = data.user.name;
          isAlreadyCalling.value = true;
        }
      });
    });
    peerConnection.ondatachannel = (e) => {
      rdc = e.channel;

      rdc.onopen = () => {
        window.alert('connected');
      };

      rdc.onmessage = (e) => {
        messages.push(JSON.parse(e.data));
      };
    };
    //?=============Peer data tranfer manager==================
    return {
      users,
      call,
      send,
      showLogin,
      submit,
      userName,
      messages,
      isAlreadyCalling,
      remoteUser,
      showHam,
      isConnected,
    };
  },
});
</script>

<template>
  <div v-if="isConnected">
    <center>
      <h1>Simple WebRTC chat</h1>
      <h3>
        Only 1-1 chat is currently possible. i.e. you can't connect to somebody
        between an ongoing chat.
      </h3>
      <h4>Best Viewd on desktop 😟😟😟</h4>
    </center>
    <div class="container c-lg">
      <div v-if="showLogin">
        <div class="row center-xs center-md">
          <div class="col-sm-6">
            <div class="login-wrap">
              <br />
              <h3>To get started please enter a name for your alias.</h3>
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
                    autofocus
                  />
                </div>
                <button class="btn btn-blue" @click="submit">Submit</button>
              </div>
              <br />
              <h4>🔰 Few notes before jumping in 🔰</h4>
              <ul>
                <li>Experimental</li>
                <li>
                  RTC peerConnection is some sort of secure. But not secure
                  entriely.
                </li>
                <li>Data is not persisted. Destroyed after refresh</li>
                <li>Definitely not meant for sensitive conversation.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div class="row" v-else>
        <div class="col-sm-3 col-xs-12 sidebar">
          <center class="ham">
            <span @click="showHam = !showHam">☰</span>
          </center>
          <ListUsers
            :connected-to="remoteUser"
            :list="users"
            :me="userName"
            @call-user="call($event)"
            :show-ham="showHam"
            @close-side="showHam = !showHam"
          />
        </div>
        <div class="col-sm-9 col-xs-12 chat">
          <ChatArea
            @send-message="send($event)"
            :messages="messages"
            :me="userName"
            :is-calling="isAlreadyCalling"
          />
        </div>
      </div>
    </div>
    <br />
    <center>
      <h3>
        Star on GitHub ::
        <b>
          <a href="https://github.com/soulsam480/ws-wrtc-client"> client repo</a
          ><span> :/:</span>
          <a href="https://github.com/soulsam480/node-ws-wrtc">
            Server repo</a
          ></b
        >
      </h3>
      <h3><a href="https://sambitsahoo.com">My Blog</a></h3>
    </center>
  </div>
  <div v-else>
    <h2 class="connect-banner">
      Connecting to server........
      <br />
      This might take a few minutes !!!
    </h2>
  </div>
</template>

<style lang="scss" scoped>
.connect-banner {
  padding-top: 50px;
  text-align: center;
}
.container {
  border-radius: 5px;
  box-shadow: 0 0.1px 5px 0.5px rgb(211, 211, 211);
  background-color: mix(white, cyan, 40%);
  height: 500px !important;
  .row {
    height: 100%;
    padding: 10px 0;
    .chat {
      position: relative;
      height: 100%;
    }
  }
  .login-wrap {
    padding: 15px;
  }
}
.login-form {
  padding: 10px;
}
.sidebar {
  position: relative;
  padding: 0;
  @media (min-width: 768px) {
    border-right: 1px solid rgb(209, 209, 209);
    .ham {
      display: none;
    }
  }
  .ham {
    position: absolute;
    left: 0;
    right: 0;
    z-index: 100;
    span {
      padding: 6px 8px;
      background-color: mix(black, cyan, 10%);
      border-radius: 1000px;
    }
  }
}
</style>
