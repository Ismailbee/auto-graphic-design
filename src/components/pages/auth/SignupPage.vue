<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-header">
        <img src="/public/image/logoauto.png" alt="Logo" class="logo" />
        <h2>Create an Account</h2>
        <p>Start your creative journey with us.</p>
      </div>
      <form @submit.prevent="handleSignup" class="auth-form">
        <div class="form-group">
          <label for="fullName">Full Name</label>
          <div class="input-wrapper">
            <i class="fas fa-user"></i>
            <input type="text" id="fullName" v-model="fullName" placeholder="John Doe" required />
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <i class="fas fa-envelope"></i>
            <input type="email" id="email" v-model="email" placeholder="you@example.com" required />
          </div>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <i class="fas fa-lock"></i>
            <input type="password" id="password" v-model="password" placeholder="Create a password" required />
          </div>
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="!loading">Sign Up</span>
          <span v-else>Creating Account...</span>
        </button>
      </form>
      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div>
    </div>
    <div class="auth-illustration">
      <img src="/public/image/design smarter.png" alt="Design Illustration" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const fullName = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const router = useRouter();

const handleSignup = () => {
  loading.value = true;
  setTimeout(() => {
    console.log('Signing up with:', fullName.value, email.value, password.value);
    loading.value = false;
    router.push('/home');
  }, 1500);
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css');

.auth-page {
  display: flex;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  background-color: #f4f7f6;
}

.auth-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 2rem 5%;
}

.auth-header {
  margin-bottom: 2rem;
  text-align: center;
}

.logo {
  height: 40px;
  margin-bottom: 1rem;
}

.auth-header h2 {
  font-size: 2rem;
  font-weight: 600;
  color: #333;
}

.auth-header p {
  color: #777;
}

.auth-form {
  width: 100%;
  max-width: 380px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #555;
}

.input-wrapper {
  position: relative;
}

.input-wrapper i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #aaa;
}

.form-group input {
  width: 100%;
  padding: 12px 15px 12px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #6a11cb;
}

.btn-submit {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  color: #777;
}

.auth-footer a {
  color: #6a11cb;
  font-weight: 600;
  text-decoration: none;
}

.auth-illustration {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  padding: 2rem;
}

.auth-illustration img {
  max-width: 100%;
  height: auto;
}

@media (max-width: 768px) {
  .auth-illustration {
    display: none;
  }
  .auth-container {
    padding: 2rem;
  }
}
</style>
