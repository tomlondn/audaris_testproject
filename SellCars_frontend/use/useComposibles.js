import { onMounted, reactive } from "vue";

export const useData = () => {
  const data = reactive({
    name: "Thomas",
    age: 42,
  });
  const setName = () => {
    data.name = "Johannes";
  };

  onMounted(() => {
    console.log(data.name);
  });

  return {
    data,
    setName,
    onMounted,
  };
};
