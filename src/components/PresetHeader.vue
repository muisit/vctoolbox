<script lang="ts" setup>
import { useTokenStore } from '@/stores/token';
import { onMounted, ref } from 'vue';
const store = useTokenStore();

const props = defineProps<{
    preset:string;
}>();

const emits = defineEmits(['onSelect']);

const allLabels = ref<string[]>([]);

onMounted(() => {
    allLabels.value = store.allAgents(props.preset);
});

const selectedPreset = ref('');
function selectPreset()
{
    store.load(props.preset, selectedPreset.value);
    emits('onSelect');
}

const visible = ref(false);
function add()
{
    visible.value = true;
    emits('onSelect'); // selecting a new value
}

function edit()
{
    visible.value = true;
}

function onClose() {
    allLabels.value = store.allAgents(props.preset);
    selectedPreset.value = store.agent;
    visible.value = false;
    emits('onSelect');
}

function onRemove()
{
    // select the first element in the allLabels list
    allLabels.value = store.allAgents(props.preset);
    if (allLabels.value.length > 0) {
        store.load(props.preset, allLabels.value[0]);
    }
    else {
        store.load(props.preset, '');
    }
}

import PresetDialog from '@/dialogs/PresetDialog.vue';
</script>
<template>
    <el-form-item label="Presets">
        <el-select @change="selectPreset" v-model="selectedPreset">
            <el-option v-for="item in allLabels" :key="item" :value="item">{{ item }}</el-option>
        </el-select>
        <el-button @click="add">Add</el-button>
        <el-button @click="edit">Edit</el-button>
        <PresetDialog :preset="props.preset" :visible="visible" @on-close="onClose" @on-remove="onRemove"/>
    </el-form-item>    
</template>