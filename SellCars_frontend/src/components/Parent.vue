<script setup>
import { provide, ref } from "vue";
import Child from "./Child.vue";
import { useData } from "../../use/useComposibles";

const { data, setName } = useData();

const name = ref("Lukas");

provide("providevalue", name);

function changeIt(data) {
  name.value = data;
}
</script>
<template>
  <h1>{{ data.name }}</h1>
  <button v-on:click="setName">Change Name</button>

  <Child :name="name" @changeString="changeIt">
    <template #slot1>
      <h2>Slot 1 Überschrift</h2>
      <p>Unser Slot Content</p>
    </template>
    <template #slot2>
      <h2>Slot 2 Überschrift</h2>
      <p>Unser Slot Content</p>
    </template>
  </Child>
</template>
