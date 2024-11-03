<script setup lang="ts">
import { databaseURL } from '@/firebase';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { GoogleLogin, decodeCredential } from 'vue3-google-login';
import WaterAnimation from '@/components/WaterAnimation.vue';

interface CredentialResponse {
  credential: string;
  select_by: string;
}

interface DecodedCredential {
  name: string;
  email: string;
  picture: string;
  sub: string;
}

const router = useRouter();

// Callback function for Google login
const callback = async (response: CredentialResponse) => {
  if (response.credential) {
    const decoded = decodeCredential(response.credential) as DecodedCredential;

    const userData = {
      displayName: decoded.name,
      email: decoded.email,
      photoURL: decoded.picture,
      uid: decoded.sub
    };

    try {
      const response = await axios.post(`${databaseURL}/users.json`, userData);
      localStorage.setItem('userId', response.data.name);
      console.log("User data posted to Firebase:", response.data);
      router.push({ path: '/play-game' });

    } catch (error) {
      console.error("Error posting user data to Firebase:", error);
    }
  } else {
    console.error("No credential found in response");
  }
};
</script>

<template>
  <div class="content login">
    <div class="box-logo">
    <img src="@/assets/logo.png" alt="logo" class="logo" />
    <div class="btn">
      <div id="container-stars">
        <div id="stars"></div>
      </div>
      <GoogleLogin :callback="callback" class="google-login-button" />
      <div id="glow">
        <div class="circle"></div>
        <div class="circle"></div>
      </div>
    </div>
    </div>
    <!-- <WaterAnimation /> -->
  </div>
</template>

<style scoped>
.login{
  position: relative;
}

.box-logo{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  width: 100%;
  z-index: 10;
}

.logo{
  width: 100%;
  max-width: 250px;
  margin-bottom: 20px;
}
.google-login-button{
  position: relative;
  cursor: pointer;
  z-index: 100;
  opacity: 0.01;
}
</style>