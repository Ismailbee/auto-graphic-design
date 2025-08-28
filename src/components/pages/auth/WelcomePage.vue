<template>
  <div class="welcome-page">
    <div class="content-wrapper">
      <div class="logo-container">
        <img src="/public/image/logoauto.png" alt="Audio Graphic Design Logo" class="logo" />
        <h1 class="app-title">Audio Graphic Design</h1>
      </div>
      <h2 class="main-headline">Where Creativity Meets Sound</h2>
      <p class="tagline">
        The ultimate platform for crafting stunning visuals and immersive audio experiences.
        Start your journey with us today.
      </p>
      <div class="action-buttons">
        <router-link to="/login" class="btn btn-primary">Get Started</router-link>
        <router-link to="/signup" class="btn btn-secondary">Learn More</router-link>
      </div>
    </div>
    <div class="shape-1"></div>
    <div class="shape-2"></div>
    <div class="shape-3"></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

.welcome-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
  color: white;
  font-family: 'Poppins', sans-serif;
  overflow: hidden;
  position: relative;
}

.content-wrapper {
  text-align: center;
  z-index: 1;
  padding: 20px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  margin-bottom: 2rem;
}

.logo {
  height: 50px;
  animation: float 3s ease-in-out infinite;
}

.app-title {
  font-size: 2rem;
  font-weight: 600;
}

.main-headline {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  letter-spacing: 1px;
  text-shadow: 0 4px 15px rgba(0,0,0,0.2);
}

.tagline {
  font-size: 1.2rem;
  max-width: 600px;
  margin: 0 auto 2.5rem;
  font-weight: 300;
  opacity: 0.9;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.btn {
  padding: 15px 35px;
  border: 2px solid white;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary {
  background-color: white;
  color: #6a11cb;
}

.btn-primary:hover {
  background-color: transparent;
  color: white;
  transform: translateY(-3px);
}

.btn-secondary {
  background-color: transparent;
}

.btn-secondary:hover {
  background-color: white;
  color: #6a11cb;
  transform: translateY(-3px);
}

/* Animated shapes */
.shape-1, .shape-2, .shape-3 {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float-bg 20s ease-in-out infinite;
}

.shape-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-duration: 25s;
}

.shape-2 {
  width: 100px;
  height: 100px;
  top: 70%;
  right: 15%;
  animation-duration: 30s;
}

.shape-3 {
  width: 150px;
  height: 150px;
  bottom: 15%;
  left: 20%;
  animation-duration: 20s;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

@keyframes float-bg {
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(180deg); }
  100% { transform: translateY(0px) rotate(360deg); }
}
</style>
