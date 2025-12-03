<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useTokenStore } from '@/stores/token';
const store = useTokenStore();

const preset = "verifier";

const presentation = ref('');
const dcql = ref('');
const requestId = ref('');
const requestUri = ref('');
const checkUri = ref('');
const timer = ref<any>(null);

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
    }
})

function updateDataInStore()
{
    const dataPackage = {
        presentation: presentation.value,
        dcql: dcql.value
    };
    store.update(preset, store.agent, dataPackage);
}

async function generate()
{
    updateDataInStore();
    let url:string;
    let body = '{}';
    if (dcql.value && dcql.value.length > 0) {
        try {
            const query = JSON.stringify(JSON.parse(dcql.value), null, 2);
            dcql.value = query;
        }
        catch (e) {
            alert("Query is not a proper JSON");
            return;
        }
        url = store.url + '/api/create-dcql-offer';
        body = JSON.stringify({dcql: dcql.value});
    }
    else if(presentation.value && presentation.value.length) {
        url = store.url + '/api/create-offer/' + presentation.value;
    }
    else {
        alert("Enter one of presentation or query");
        return false;
    }

    const response = await fetch(url, {
        method:'POST',
        body: body,
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + store.token
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

function startTimer()
{
    if (timer.value) {
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
            headers: {"Content-Type": "application/json", "Authorization": "Bearer " + store.token}
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

function selectPreset()
{
    const item = store.load(preset, store.agent);
    if (item && Object.keys(item).length > 0) {
        presentation.value = item.presentation ?? '';
        dcql.value = item.dcql ?? '';
    }
}

import QrcodeVue from 'qrcode.vue';
import PresetHeader from '@/components/PresetHeader.vue';
</script>
<template>
    <el-form label-position="left" label-width="auto">
        <div><h1>Verifier</h1><br/></div>
        <PresetHeader @on-select="selectPreset" :preset="preset" />
        <el-collapse>
            <el-collapse-item title="Details">
                <el-form-item label="URL">
                    <el-input v-model="store.url" type="text" disabled/>
                </el-form-item>
                <el-form-item label="Presentation">
                    <el-input v-model="presentation" type="text"/>
                </el-form-item>
                <el-form-item label="Query">
                    <el-input v-model="dcql" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
                </el-form-item>
            </el-collapse-item>
        </el-collapse>
        <el-form-item label="Actions">
            <el-button @click="generate">Generate</el-button>
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