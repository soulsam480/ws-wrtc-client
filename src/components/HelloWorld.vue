<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client/build/socket";

export default defineComponent({
  name: "HelloWorld",
  setup: () => {
    let socket: Socket;
    const sender = ref<string>("");
    const users = reactive<Array<string>>([]);
    let isAlreadyCalling = false;

    //todo rtc
    const { RTCPeerConnection, RTCSessionDescription } = window;
    const peerConnection = new RTCPeerConnection();
    const dc = peerConnection.createDataChannel("chanel");
    let rdc: RTCDataChannel;

    //todo methods
    const call = async (id: any) => {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(
        new RTCSessionDescription(offer)
      );
      socket.emit("call-user", {
        offer,
        to: id,
      }); 
    };
    const Send = () => {
      dc.send(sender.value);
      socket.emit("text-data", {
        text: sender.value,
      });
    };
    const backFired = () => {
      dc.send(sender.value);
      socket.emit("text-data", {
        text: sender.value,
      });
    };

    //todo add rtc
    onMounted(() => {
      socket = io("https://soulsam480-node-ws-wrtc.glitch.me", {
        transports: ["websocket"],
      });

      //?=====================
      socket.on("update-user-list", (data: any) => {
        console.log(data);

        data.users.forEach((el: any) => {
          if (!users.find((eli) => eli === el)) {
            users.push(el);
          }
        });
      });

      //?====================
      socket.on("remove-user", (data: any) => {
        users.splice(users.indexOf(data.socketId), 1);
      });

      //?-====================================
      socket.on("call-made", async (data: any) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(
          new RTCSessionDescription(answer)
        );

        socket.emit("make-answer", {
          answer,
          to: data.socket,
        });
      });

      //?==============================

      socket.on("answer-made", async (data: any) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(data.answer)
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
        rdc.onopen = (e) => console.log("connected");
      };
    });

    return { sender, users, call, Send, backFired };
  },
});
</script>

<template>
  <div>
    <center><h1>WS RTC client</h1></center>
    <div class="container">
      <div>
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
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
