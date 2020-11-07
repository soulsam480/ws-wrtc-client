<script lang="ts">
import { defineComponent, onMounted, reactive, ref } from "vue";
import { io } from "socket.io-client";
import { Socket } from "socket.io-client/build/socket";

export default defineComponent({
  name: "HelloWorld",
  setup: () => {
    let socket: Socket;
    const sender = ref<string>();
    const receiver = ref<string>();
    const users = reactive<Array<string>>([]);

    const { RTCPeerConnection, RTCSessionDescription } = window;

    const peerConnection = new RTCPeerConnection();
    const call = async (id: any) => {
      console.log(id);

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(
        new RTCSessionDescription(offer)
      );

      socket.emit("call-user", {
        offer,
        to: id,
      });
    };

    onMounted(() => {
      socket = io("http://localhost:4000", {
        transports: ["websocket"],
      });

      socket.on("update-user-list", (data: any) => {
        console.log(data);

        data.users.forEach((el: any) => {
          if (!users.find((eli) => eli === el)) {
            users.push(el);
          }
        });
      });
    });
    return { sender, receiver, users, call };
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
            id=""
            cols="30"
            rows="10"
          ></textarea>
        </div>
        <div class="col-sm-6 col-md-6 col-xs-12">
          <p>From Receiver</p>
          <textarea
            name="sender"
            v-model="receiver"
            id=""
            cols="30"
            rows="10"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
