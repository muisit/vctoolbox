<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const label = ref('');
const agent = ref('');
const token = ref('');
const presentation = ref('');
const requestId = ref('');
const requestUri = ref('');
const checkUri = ref('');
const allLabels = ref<string[]>([]);
const timer = ref<any>(null);

onMounted(() => {
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets_verifier") || "{}");
    allLabels.value = Object.keys(allItems);
})

onUnmounted(() => {
    if (timer.value) {
        console.log('clearing timer on unmount');
        clearInterval(timer.value);
        timer.value = null;
    }
})

async function generate()
{
    add();
    const url = agent.value + '/api/create-offer/' + presentation.value;

    const response = await fetch(url, {
        method:'POST',
        body: "{}",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token.value
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response && response.requestUri && response.state) {
        requestId.value = response.state;
        requestUri.value = response.requestUri;
        checkUri.value = response.checkUri;
        console.log(response);

        startTimer();
    }
}

function add()
{
    const dataPackage = {
        label: label.value,
        agent: agent.value,
        token: token.value,
        presentation: presentation.value
    };
    localStorage.setItem(label.value, JSON.stringify(dataPackage));

    const allItems = JSON.parse(localStorage.getItem("toolbox_presets_verifier") || "{}");
    allItems[label.value] = label.value;
    localStorage.setItem("toolbox_presets_verifier", JSON.stringify(allItems));
    allLabels.value = Object.keys(allItems);
}

function remove()
{
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets_verifier") || "{}");
    if (allItems[label.value]) {
        delete allItems[label.value];
        localStorage.setItem("toolbox_presets_verifier", JSON.stringify(allItems));
        localStorage.removeItem(label.value);
        allLabels.value = Object.keys(allItems);

        label.value = '';
        token.value = '';
        agent.value = '';
        presentation.value = '';
    }
}

function startTimer()
{
    if (timer.value) {
        console.log("clearing old timer");
        clearInterval(timer.value);
        timer.value = null;
    }
    isWaiting.value = false;

    console.log("starting timer ever 2 seconds");
    timer.value = setInterval(callCheckApi, 2000);
}

const isWaiting = ref(false);
const status = ref('');
const requests = ref<any>([]);

async function callCheckApi()
{
    console.log("calling check url");
    if (isWaiting.value === true) {
        console.log('not polling, because we are still waiting');
        return;
    }

    isWaiting.value = true;
    const response = await fetch(checkUri.value, {
            method: 'GET',
            headers: {"Content-Type": "application/json", "Authorization": "Bearer " + token.value}
        })
        .then((r) => r.json());
    isWaiting.value = false;
    status.value = response.status;
    requests.value = response.result;

    if (response.status == 'RESPONSE_RECEIVED') {
        console.log('clearing timer after receiving response');
        clearInterval(timer.value);
        timer.value = null;
    }
}

const selectedPreset = ref('');
function selectPreset()
{
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets_verifier") || "{}");
    if (allItems[selectedPreset.value]) {
        const item = JSON.parse(localStorage.getItem(selectedPreset.value) || '{}');
        label.value = item.label;
        token.value = item.token;
        agent.value = item.agent;
        presentation.value = item.presentation;
    }
}

import QrcodeVue from 'qrcode.vue'
</script>
<template>
    <el-form label-position="left" label-width="auto">
        <el-form-item label="Presets">
            <el-select @change="selectPreset" v-model="selectedPreset">
                <el-option v-for="item in allLabels" :key="item" :value="item">{{ item }}</el-option>
            </el-select>
        </el-form-item>
        <el-collapse>
            <el-collapse-item title="Details">
                <el-form-item label="Label">
                    <el-input v-model="label" type="text"/>
                </el-form-item>
                <el-form-item label="Agent">
                    <el-input v-model="agent" type="text"/>
                </el-form-item>
                <el-form-item label="Presentation">
                    <el-input v-model="presentation" type="text"/>
                </el-form-item>
                <el-form-item label="Token">
                    <el-input v-model="token" type="text"/>
                </el-form-item>
            </el-collapse-item>
        </el-collapse>
        <el-form-item label="Actions">
            <el-button @click="generate">Generate</el-button>
            <el-button @click="remove">Delete</el-button>
        </el-form-item>
        <qrcode-vue :value="requestUri" :size="300"></qrcode-vue>
        <el-form-item label="RequestURI">
            {{ requestUri }}
        </el-form-item>
        <el-form-item label="Status">
            {{ status }}
        </el-form-item>
        <el-form-item label="Requests" class="requests">
            <pre>{{ JSON.stringify(requests, null, 2) }}</pre>
        </el-form-item>
    </el-form>    
</template>