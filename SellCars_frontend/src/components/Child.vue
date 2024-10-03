<script setup>
import { ref, inject } from "vue";
const name = "Sebastian";
const injectedName = inject("providevalue");

const props = defineProps({
  name: {
    type: String,
    default: "Unbekannter User",
  },
});
const emit = defineEmits(["changeString"]);
function handleClick() {
  emit("changeString", name);
}
</script>

<template>
  <div>
    <h1>Child Component</h1>
    <h2>{{ props.name }}</h2>
    <p>p{{ injectedName }}</p>
    <slot name="slot1"></slot>
    <button v-on:click="handleClick">Change String</button>
    <slot name="slot2"></slot>
  </div>
</template>
<style scoped></style>
