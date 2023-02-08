<script setup>
defineProps({
    place_id: {
        type: [String, Number],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
})
defineEmits(['removePlace'])
</script>

<template>
    <div class="relative shadow p-4 rounded-xl mb-4">
        <h2 class="text-2xl font-bold">{{ name }}</h2>
        <p class="text-gray-500">{{ address }}</p>
        <button type="button" @click="$emit('removePlace', { place_id })" class="absolute top-4 right-4"
            title="Remove place">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    </div>
</template>