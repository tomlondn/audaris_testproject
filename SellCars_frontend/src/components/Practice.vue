<script setup>
import { ref, reactive, computed, watch } from "vue";
const props = defineProps({
  name: {
    type: String,
    default: "Unbekannter User",
  },
});

const name = "Sebastian";

const emit = defineEmits(["changeString"]);

function handleClick() {
  emit("changeString");
}

// primitive Types State Binding with ref
//let x = ref(10);
//let string = ref("Moin")

// Referenze Tyes (Array, Object) State binding with reactive
const stateData = reactive({
  count: 0,
  string: "Moin",
});

const higherLower = computed(() => {
  if (stateData.count < 10) {
    return "smaller";
  } else if (stateData.count === 10) {
    return "equal";
  } else {
    return "larger";
  }
});

function stringOfTodoState(state) {
  return state ? "Erledigt" : "Nicht erledigt";
}

const todos = [
  {
    desc: "Programmieren",
    done: true,
  },
  {
    desc: "Sport",
    done: false,
  },
  {
    desc: "Kochen",
    done: false,
  },
];

watch(
  () => stateData.count,
  (newValue, oldValue) => {
    if (newValue === 10) {
      alert(`Wert hat ${newValue} erreicht`);
    }
    console.log(newValue, oldValue);
  }
);

function increase(value) {
  stateData.count -= value;
}
function decrease(value) {
  stateData.count += value;
}
</script>

<template>
  <div>
    <h1>Event Buttons</h1>
    <h2>{{ props.name }}</h2>
    <p>{{ stateData.count }}</p>
    <button v-on:click="increase(1)">--</button>
    <button v-on:click="decrease(1)">++</button>
    <p>{{ stateData.string }}</p>
    <p>{{ higherLower }}</p>

    <p v-if="stateData.count > 10">Larger</p>
    <p v-else>smaller</p>
    <hr />

    <div v-for="(item, index) in todos" :key="item.desc">
      <div :class="{ open: !item.done, closed: item.done }">
        <p>{{ index + 1 }}: {{ item.desc }}</p>
        <p>Status: {{ stringOfTodoState(item.done) }}</p>
      </div>
    </div>
    <button v-on:click="handleClick">Change String</button>
    <input type="text" v-model="stateData.string" />
  </div>
</template>
<style scoped>
.open,
.closed {
  color: white;
}
.open {
  background-color: darkred;
}
.closed {
  background-color: darkgreen;
}
</style>
