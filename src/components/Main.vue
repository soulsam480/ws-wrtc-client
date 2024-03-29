<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
import { defineComponent, onMounted, ref, watchEffect } from 'vue';
import { io } from 'socket.io-client';
import ListUsers from '@/components/ListUsers.vue';
import ChatArea from '@/components/ChatArea.vue';
import { Message, User } from '@/utils/models';
import Peer from 'simple-peer';
export default defineComponent({
  name: 'Main',
  components: {
    ListUsers,
    ChatArea,
  },
  setup() {
    const wsUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://soulsam480-node-ws-wrtc.glitch.me'
        : 'http://localhost:3000';
    const config = {
      iceServers: [
        {
          urls: ['turn:13.250.13.83:3478?transport=udp'],
          username: 'YzYNCouZM1mhqhmseWk6',
          credential: 'YzYNCouZM1mhqhmseWk6',
        },
        {
          urls: [
            'stun:stun.l.google.com:19302',
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
    };
    let peerConnection = ref<Peer.Instance | null>(null).value;
    const users = ref<Array<User>>([]).value;
    const messages = ref<Array<Message>>([]).value;
    const socket = io(wsUrl, {
      transports: ['websocket'],
    });

    const showLogin = ref(true);
    const isAlreadyCalling = ref(false);
    const showHam = ref(false);
    const userName = ref('');
    const remoteUser = ref('');
    const isConnected = ref(false);
    const stream = ref<MediaStream | null>(null);
    const isMuted = ref(true);
    const modal = ref<{
      isOpen: boolean;
      type: 'call' | 'rejection' | '';
      rejectedBy?: string;
    }>({
      isOpen: false,
      type: '',
      rejectedBy: '',
    });
    function resetModal() {
      modal.value = { isOpen: false, type: '', rejectedBy: '' };
    }
    const callContext = ref<{ name: string; accept: boolean | null }>({
      name: '',
      accept: null,
    });
    const submit = () => {
      socket.emit('add-user', {
        name: userName.value,
      });
      showLogin.value = !showLogin.value;
    };
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then((media) => {
        stream.value = media;
        stream.value.getAudioTracks()[0].enabled = false;
      })
      .catch((err) => console.log(err));

    function toggleAudio() {
      (stream.value as MediaStream).getAudioTracks()[0].enabled = !(stream.value as MediaStream).getAudioTracks()[0]
        .enabled;
      isMuted.value = !isMuted.value;
    }
    function closeCall() {
      peerConnection?.end();
    }
    function killAudio() {
      const audio = document.querySelector('audio') as HTMLAudioElement;
      audio.load();
      if ('srcObject' in audio) {
        audio.srcObject = null;
      } else {
        (audio as HTMLAudioElement).src = '';
        (audio as HTMLAudioElement).removeAttribute('src');
      }
    }
    function createSender(id: string) {
      peerConnection = new Peer({
        initiator: true,
        trickle: false,
        stream: stream.value as MediaStream,
        config,
      });
      peerConnection?.on('signal', (data) => {
        if (data.renegotiate || data.transceiverRequest) return;
        socket.emit('call-user', {
          offer: JSON.stringify(data),
          user: {
            name: userName.value,
            id: socket.id,
          },
          to: id,
        });
      });

      peerConnection?.on('data', (data) => {
        messages.push(JSON.parse(new TextDecoder().decode(data)));
      });
      peerConnection.on('close', () => {
        killAudio();
        isAlreadyCalling.value = false;
        remoteUser.value = '';
        isMuted.value = true;
        (stream.value as MediaStream).getAudioTracks()[0].enabled = false;
        peerConnection = null;
      });
      peerConnection?.on('stream', (stream) => {
        const audio = document.querySelector('audio') as HTMLAudioElement;
        audio.load();
        if ('srcObject' in audio) {
          audio.srcObject = stream;
        } else {
          (audio as any).src = window.URL.createObjectURL(stream); // for older browsers
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log(error);
            audio.pause();
          });
        }
      });
    }
    function createReceiver(data: any) {
      const peer = new Peer({
        trickle: false,
        stream: stream.value as MediaStream,
        config,
      });
      peerConnection = peer;
      peerConnection?.signal(data.offer);
      peerConnection?.on('signal', (dat) => {
        if (data.renegotiate || data.transceiverRequest) return;
        socket.emit('make-answer', {
          answer: JSON.stringify(dat),
          to: data.user.id,
          user: {
            name: userName.value,
            id: socket.id,
          },
        });
        remoteUser.value = data.user.name;
        isAlreadyCalling.value = true;
      });
      peerConnection?.on('data', (data) => {
        messages.push(JSON.parse(new TextDecoder().decode(data)));
      });
      peerConnection?.on('connect', () => {
        console.log('connected');
        window.alert('connected!');
      });
      peerConnection.on('close', () => {
        killAudio();
        isAlreadyCalling.value = false;
        remoteUser.value = '';
        isMuted.value = true;
        (stream.value as MediaStream).getAudioTracks()[0].enabled = false;
        peerConnection = null;
      });
      peerConnection?.on('stream', (stream) => {
        const audio = document.querySelector('audio') as HTMLAudioElement;
        audio.load();
        if ('srcObject' in audio) {
          audio.srcObject = stream;
        } else {
          (audio as any).src = window.URL.createObjectURL(stream); // for older browsers
        }
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.log(error);
            audio.pause();
          });
        }
      });
    }
    const sendMessage = (val: Message) => {
      val.at = new Date().toISOString();
      val.from = userName.value;
      messages.push({ ...val });
      peerConnection?.send(JSON.stringify(val));
    };

    onMounted(() => {
      socket.on('connect', () => {
        isConnected.value = true;
      });

      socket.on('update-user-list', (data: any) => {
        data.users.forEach((el: any) => {
          if (!users.find((eli) => eli.id === el.id)) {
            users.push(el);
          }
        });
      });

      socket.on('remove-user', (data: any) => {
        console.log(`user ${data.socketId} is disconnected.`);
        users.splice(
          users.findIndex((el) => el.id === data.socketId),
          1,
        );
      });

      socket.on('call-made', async (data: any) => {
        callContext.value = { name: data.user.name, accept: null };
        modal.value = { isOpen: true, type: 'call' };
        watchEffect(() => {
          if (callContext.value.accept === true) {
            createReceiver(data);
            modal.value = { isOpen: false, type: '' };
          } else if (callContext.value.accept === false) {
            socket.emit('make-rejection', {
              to: data.user.id,
              user: {
                name: userName.value,
                id: socket.id,
              },
            });
            modal.value = { isOpen: false, type: '' };
          }
        });
      });

      socket.on('rejected', (data: any) => {
        console.log('rejected by ' + data.user.name);
        modal.value = {
          isOpen: true,
          type: 'rejection',
          rejectedBy: data.user.name,
        };
      });

      socket.on('answer-made', async (data: any) => {
        peerConnection?.signal(data.answer);
        peerConnection?.on('connect', async () => {
          console.log('connected');
          window.alert('connected!');
          remoteUser.value = data.user.name;
          isAlreadyCalling.value = true;
        });
      });
    });

    return {
      users,
      sendMessage,
      showLogin,
      submit,
      userName,
      messages,
      isAlreadyCalling,
      remoteUser,
      showHam,
      isConnected,
      createSender,
      isMuted,
      toggleAudio,
      closeCall,
      modal,
      callContext,
      resetModal,
    };
  },
});
</script>

<template>
  <div v-if="isConnected">
    <div id="myModal" class="modal" v-if="modal.isOpen">
      <div class="modal-content">
        <template v-if="modal.type === 'call'">
          <p>{{ callContext.name }} is Calling. Accept ?</p>
          <button
            class="btn btn-indigo"
            style="margin-right: 5px"
            @click="callContext.accept = true"
          >
            Yes
          </button>
          <button class="btn btn-red" @click="callContext.accept = false">
            NO
          </button>
        </template>
        <template v-else-if="modal.type === 'rejection'">
          <p>{{ modal.rejectedBy }} rejected call !!</p>
          <button class="btn" @click="resetModal">OK</button>
        </template>
      </div>
    </div>
    <div class="text-center">
      <h1>Simple WebRTC chat</h1>
      <h1 class="indigo">
        Unmute yourself after connecting to start voice call !!
      </h1>
      <h3>
        Only 1-1 chat is currently possible. i.e. you can't connect to somebody
        between an ongoing chat.
      </h3>
      <h3 class="red"><b>Close an ongoing call to start a new one.</b></h3>
      <h4>Best Viewd on desktop 😟😟😟</h4>
    </div>
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
          <span class="ham text-center">
            <span @click="showHam = !showHam">☰</span>
          </span>
          <ListUsers
            :connected-to="remoteUser"
            :list="users"
            :me="userName"
            @call-user="createSender($event)"
            :show-ham="showHam"
            @close-side="showHam = !showHam"
            :isMuted="isMuted"
            @toggle-mute="toggleAudio"
            @close-call="closeCall"
          />
        </div>
        <div class="col-sm-9 col-xs-12 chat">
          <ChatArea
            @send-message="sendMessage($event)"
            :messages="messages"
            :me="userName"
            :is-calling="isAlreadyCalling"
          />
        </div>
      </div>
    </div>
    <br />
    <div class="text-center">
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
    </div>
    <!-- <video></video> -->
    <audio hidden aria-hidden="true"></audio>
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
.modal {
  display: block; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 1; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background-color: rgb(0, 0, 0); /* Fallback color */
  background-color: rgba(0, 0, 0, 0.4); /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
  text-align: center;
  background-color: #fefefe;
  margin: 15% auto; /* 15% from the top and centered */
  padding: 20px;
  border: 1px solid #888;
  width: 80%; /* Could be more or less, depending on screen size */
}

/* The Close Button */
.close {
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
}

.close:hover,
.close:focus {
  color: black;
  text-decoration: none;
  cursor: pointer;
}
.text-center {
  text-align: center;
}
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
