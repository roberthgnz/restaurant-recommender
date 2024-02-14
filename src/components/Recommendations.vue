<script setup>
import { computed } from "vue";
import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

const props = defineProps(['value'])

const html = computed(() => {
    return marked(props.value)
})
</script>

<template>
    <div class="shadow p-4 rounded-xl text-gray-500 mt-4" v-html="html"></div>
</template>
