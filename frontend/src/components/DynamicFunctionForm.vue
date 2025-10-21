<template>
  <div class="p-6 max-w-5xl mx-auto bg-white rounded-2xl shadow">
    <h1 class="text-2xl font-bold mb-6">Dynamic SQL Function Runner</h1>

    <!-- Function selector -->
    <div class="mb-6">
      <label class="font-semibold mb-2 block text-gray-700">Select Function</label>
      <select
        v-model="selectedFunctionName"
        @change="onFunctionChange"
        class="border p-2 rounded w-full"
      >
        <option disabled value="">Select function...</option>
        <option v-for="fn in functionDefinitions" :key="fn.function_name" :value="fn.function_name">
          {{ fn.function_name }}
        </option>
      </select>
    </div>

    <!-- Dynamic form -->
    <div v-if="activeFunction">
      <h2 class="text-lg font-semibold mb-3">Parameters</h2>
      <div class="grid md:grid-cols-3 gap-4 mb-6">
        <div v-for="param in activeFunction.parameters" :key="param.name" class="flex flex-col">
          <label :for="param.name" class="font-medium mb-1">{{ param.name }}</label>
          <input
            v-if="param.type === 'date'"
            type="date"
            v-model="formData[param.name]"
            class="border p-2 rounded"
          />
          <input
            v-else-if="['int', 'decimal', 'numeric'].includes(param.type)"
            type="number"
            v-model.number="formData[param.name]"
            class="border p-2 rounded"
          />
          <input
            v-else
            type="text"
            v-model="formData[param.name]"
            class="border p-2 rounded"
          />
        </div>
      </div>

      <!-- Collapsible Filters -->
      <div class="border rounded-lg p-4 bg-gray-50 mb-6">
        <div
          @click="showFilters = !showFilters"
          class="flex justify-between items-center cursor-pointer mb-3"
        >
          <h2 class="text-lg font-semibold">Filters</h2>
          <span class="text-sm text-gray-500">{{ showFilters ? '▲' : '▼' }}</span>
        </div>

        <transition name="fade">
          <div v-show="showFilters">
            <div
              v-for="(filter, idx) in filters"
              :key="idx"
              class="flex flex-wrap gap-2 mb-2 items-center"
            >
              <select v-model="filter.field" class="border p-2 rounded w-40" @change="onFilterFieldChange(filter)">
                <option disabled value="">Field</option>
                <option v-for="f in activeFunction.result_fields" :key="f.name" :value="f.name">
                  {{ f.name }}
                </option>
              </select>

              <select v-model="filter.operator" class="border p-2 rounded w-28">
                <option value="=">=</option>
                <option value="<>">≠</option>
                <option value=">">&gt;</option>
                <option value="<">&lt;</option>
                <option value=">=">&ge;</option>
                <option value="<=">&le;</option>
                <option v-if="isTextField(filter.field)" value="LIKE">LIKE</option>
              </select>

              <input
                v-if="getFieldType(filter.field) === 'date'"
                type="date"
                v-model="filter.value"
                class="border p-2 rounded flex-1"
              />
              <input
                v-else-if="['int', 'decimal', 'numeric'].includes(getFieldType(filter.field))"
                type="number"
                v-model.number="filter.value"
                class="border p-2 rounded flex-1"
              />
              <input
                v-else
                type="text"
                v-model="filter.value"
                class="border p-2 rounded flex-1"
              />

              <button type="button" @click="removeFilter(idx)" class="text-red-600 font-bold hover:underline">
                ✕
              </button>
            </div>

            <button
              type="button"
              class="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
              @click="addFilter"
            >
              + Add Condition
            </button>
          </div>
        </transition>
      </div>

      <button
        @click="handleSubmit"
        class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
      >
        Run Query
      </button>

      <div v-if="submitted" class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-3">API Response</h2>
        <pre class="bg-gray-100 rounded-xl p-3 text-sm text-gray-700 overflow-x-auto max-h-80">
{{ JSON.stringify(result, null, 2) }}
        </pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import axios from "axios";
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:4000',
  withCredentials: true
});

const functionDefinitions = ref([]);
const selectedFunctionName = ref("");
const activeFunction = ref(null);
const formData = reactive({});
const filters = ref([]);
const submitted = ref(false);
const showFilters = ref(true);
const result = ref(null);

onMounted(async () => {
  try {
    const res = await api.get("/api/functions");
    functionDefinitions.value = res.data;
  } catch (error) {
    console.error('Failed to fetch functions:', error);
  }
});

function onFunctionChange() {
  activeFunction.value = functionDefinitions.value.find(
    (f) => f.function_name === selectedFunctionName.value
  );
  Object.keys(formData).forEach((k) => delete formData[k]);
  activeFunction.value.parameters.forEach((p) => (formData[p.name] = ""));
  filters.value = [];
  submitted.value = false;
}

function addFilter() {
  filters.value.push({ field: "", operator: "=", value: "" });
}

function removeFilter(idx) {
  filters.value.splice(idx, 1);
}

function getFieldType(fieldName) {
  const field = activeFunction.value.result_fields.find((f) => f.name === fieldName);
  return field ? field.type : "nvarchar";
}

function isTextField(fieldName) {
  const type = getFieldType(fieldName);
  return ["nvarchar", "varchar", "text"].includes(type.toLowerCase());
}

function onFilterFieldChange(filter) {
  if (!isTextField(filter.field) && filter.operator === "LIKE") {
    filter.operator = "=";
  }
}

async function handleSubmit() {
  try {
    const payload = {
      function_name: activeFunction.value.function_name,
      parameters: { ...formData },
      filters: filters.value
    };
    const res = await api.post("/api/executeFunction", payload);
    result.value = res.data;
    submitted.value = true;
  } catch (error) {
    console.error('Failed to execute function:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized error, possibly redirect to login
      window.location.href = '/auth/login';
    }
  }
}
</script>
