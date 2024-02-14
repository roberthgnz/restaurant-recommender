<script setup>
import { inject } from '@vercel/analytics'
import { onMounted, ref } from "vue";
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

import Icon from './assets/icon.svg'

import TheHeader from './components/TheHeader.vue'
import TheFooter from './components/TheFooter.vue'
import Map from './components/Map.vue'
import Place from "./components/Place.vue";
import Recommendations from "./components/Recommendations.vue";

const places = ref([]);
const context = ref("");
const result = ref("");

const isLoading = ref(false);

const defaultContext = "I'm looking for a place to eat seafood with my family.";

const moveScroll = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: "smooth",
  });
};

const getCompletion = async () => {
  let timer;

  try {
    isLoading.value = true;

    result.value = "";

    const controller = new AbortController();
    const signal = controller.signal;

    timer = setTimeout(() => {
      controller.abort()
    }, 50000)

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        context: context.value || defaultContext,
        places: places.value,
      }),
      signal,
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    if (!data) {
      return;
    }

    result.value = data[0].text

    moveScroll();
  } catch (error) {
    if (error.name === 'AbortError') {
      toast.error('Request timed out', {
        autoClose: 3000,
      });
    } else {
      toast.error(error.message, {
        autoClose: 3000,
      });
    }
  } finally {
    clearTimeout(timer)
    isLoading.value = false;
  }
};

const handleAdd = (place) => {
  places.value.push(place);
  moveScroll();
};

const handleRemove = (place) => {
  if (confirm("Are you sure you want to remove this place?")) {
    places.value = places.value.filter((p) => p.place_id !== place.place_id);
  }
};

onMounted(inject)
</script>

<template>
  <div class="flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen">
    <TheHeader />
    <main class="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-4">
      <div class="flex flex-col gap-4">
        <img :src="Icon" class="w-64 h-64 mx-auto" />
        <p class="mx-auto font-sans text-4xl font-extrabold max-w-xl text-center">Find your next delicious meal with
          ease using
          our
          <span
            class="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">AI-powered</span>
          restaurant
          recommendation
          website.
        </p>
        <div class="flex items-center my-4">
          <span
            class="w-8 h-8 rounded-full font-medium bg-black text-white inline-flex items-center justify-center mr-2">1</span>
          <p class="text-left font-medium">Search for a place.</p>
        </div>
        <Map :places="places" @addPlace="handleAdd" @removePlace="handleRemove" />
        <div class="flex items-center my-4">
          <span
            class="w-8 h-8 rounded-full font-medium bg-black text-white inline-flex items-center justify-center mr-2">2</span>
          <p class="text-left font-medium">Add a place to get started.</p>
          <p class="ml-2 block">You can add up to 5 places.</p>
        </div>
        <div v-if="places.length" class="text-center max-w-[800px]">
          <div class="flex flex-col justify-center">
            <Place v-for="place in places" :key="place.place_id" :place_id="place.place_id" :name="place.name"
              :address="place.formatted_address" @removePlace="handleRemove" />
          </div>
          <div class="flex items-center my-4">
            <span
              class="w-8 h-8 rounded-full font-medium bg-black text-white inline-flex items-center justify-center mr-2">3</span>
            <p class="text-left font-medium">Give some context.</p>
          </div>
          <textarea rows="4" class="w-full rounded-md shadow focus:border-black focus:ring-black p-4"
            placeholder="e.g. I'm looking for a place to eat seafood with my family." v-model="context"></textarea>
          <button @click="getCompletion" type="button" :disabled="isLoading"
            class="bg-black rounded-xl text-white font-medium px-4 py-2 sm:mt-4 mt-2 hover:bg-black/80 w-full">
            {{ isLoading ? 'Loading...' : 'Generate recommendation' }}</button>
          <template v-if="result">
            <div class="mt-8">
              <h2 class="text-3xl font-bold text-slate-900 mx-auto">Your generated recommendation</h2>
              <Recommendations :value="result" />
            </div>
          </template>
        </div>
      </div>
    </main>
    <TheFooter />
  </div>
</template>
