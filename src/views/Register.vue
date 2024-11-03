<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <input type="email" v-model="email" placeholder="Email" />
      <input type="password" v-model="password" placeholder="Password" />
      <button type="submit">Register</button>
    </form>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script lang="ts">
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";

export default {
  setup() {
    const { register, error } = useAuth();
    const email = ref<string>("");
    const password = ref<string>("");

    const handleRegister = () => {
      register(email.value, password.value);
    };

    return { email, password, handleRegister, error };
  }
};
</script>