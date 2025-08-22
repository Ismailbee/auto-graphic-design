<template>
  <ion-page>
    <page-header label="Terms of Service" />

    <ion-content>
      <div class="bg-secondary min-h-screen w-full px-6 pb-24 sm:px-24 py-10">
        <div class="mx-auto max-w-3xl bg-white rounded-2xl shadow-lg p-8">
          <h1 class="text-3xl font-extrabold text-primary mb-6 text-center">Terms of Service</h1>
          <p class="text-gray-700 mb-6 text-center">
            Last updated: August 22, 2025
          </p>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">1. Acceptance of Terms</h2>
            <p class="text-gray-700">
              By accessing or using auto graphic design, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, please do not use our platform.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">2. Use of Service</h2>
            <p class="text-gray-700">
              You must be at least 13 years old to use this service. You agree not to misuse the platform or help anyone else do so. All content you create or upload must comply with our community guidelines and applicable laws.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">3. Account Security</h2>
            <p class="text-gray-700">
              You are responsible for maintaining the confidentiality of your account and password. Notify us immediately of any unauthorized use of your account.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">4. Intellectual Property</h2>
            <p class="text-gray-700">
              All content, trademarks, and data on this site, including but not limited to software, databases, text, graphics, icons, and hyperlinks are the property of auto graphic design or its licensors.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">5. Termination</h2>
            <p class="text-gray-700">
              We reserve the right to suspend or terminate your access to the service at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">6. Limitation of Liability</h2>
            <p class="text-gray-700">
              auto graphic design is provided "as is" and "as available". We do not warrant that the service will be uninterrupted or error-free. In no event shall auto graphic design be liable for any damages arising from the use or inability to use the service.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">7. Changes to Terms</h2>
            <p class="text-gray-700">
              We may update these Terms from time to time. We will notify users of any changes by updating the date at the top of this page. Continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section class="mb-6">
            <h2 class="text-xl font-bold text-primary mb-2">8. Contact Us</h2>
            <p class="text-gray-700">
              If you have any questions about these Terms, please contact us at <a href="mailto:support@goldenprinter.com" class="text-contrast underline">support@goldenprinter.com</a>.
            </p>
          </section>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import pageHeader from "../../../Header/pageHeader.vue";
</script>

<style scoped>
.bg-secondary {
  background-color: #f8f9fa;
}
.text-primary {
  color: #502800;
}
.text-contrast {
  color: #ffffff;
}
</style>