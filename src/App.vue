<script setup>
import { onMounted, ref } from "vue";

import TheHeader from './components/TheHeader.vue'

const result = ref("");

const getCompletion = async () => {
  const response = await fetch("/api/generate");

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = response.body;
  if (!data) {
    return;
  }

  const reader = data.getReader();
  const decoder = new TextDecoder();

  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    result.value += chunkValue;
  }
};
</script>

<template>
  <div class="flex max-w-5xl mx-auto flex-col items-center justify-center min-h-screen">
    <TheHeader />
    <main class="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-12 sm:mt-20">
      <p>{{ result }}</p>
    </main>
  </div>
</template>
