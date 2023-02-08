<script setup>
import { onMounted, ref } from "vue";

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
  <p>{{ result }}</p>
</template>
