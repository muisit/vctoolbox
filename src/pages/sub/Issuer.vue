<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const label = ref('');
const agent = ref('');
const token = ref('');
const credentials = ref('');
const data = ref('');
const meta = ref('');
const grant = ref('');
const requestId = ref('');
const requestUri = ref('');
const allLabels = ref<string[]>([]);
const uuid = ref('');
const statlist = ref('');
const filter = ref('');
const timer = ref<any>(null);

onMounted(() => {
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets") || "{}");
    allLabels.value = Object.keys(allItems);
})

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
    }
})

async function generate()
{
    add();
    const url = agent.value + '/api/create-offer';
    uuid.value = '';
    let creds = [credentials.value];
    if (creds[0].indexOf(',') > 0) {
        creds = creds[0].split(',').filter((v) => v != '');
    }
    const request:any = {
        credentials: creds,
        grants: JSON.parse(grant.value),
        credentialDataSupplierInput: JSON.parse(data.value)
    };
    if (meta.value != '') {
        request.credentialMetadata = JSON.parse(meta.value);
    }

    requests.value = [];
    const response = await fetch(url, {
        method:'POST',
        body: JSON.stringify(request),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token.value
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response && response.uri && response.id) {
        requestId.value = response.id;
        requestUri.value = response.uri;

        startTimer();
    }
}

function add()
{
    const dataPackage = {
        label: label.value,
        agent: agent.value,
        token: token.value,
        credential: credentials.value,
        data: data.value,
        meta: meta.value,
        grant: grant.value,
        statlist: statlist.value,
        filter: filter.value
    };
    localStorage.setItem(label.value, JSON.stringify(dataPackage));

    const allItems = JSON.parse(localStorage.getItem("toolbox_presets") || "{}");
    allItems[label.value] = label.value;
    localStorage.setItem("toolbox_presets", JSON.stringify(allItems));
    allLabels.value = Object.keys(allItems);
}

function remove()
{
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets") || "{}");
    if (allItems[label.value]) {
        delete allItems[label.value];
        localStorage.setItem("toolbox_presets", JSON.stringify(allItems));
        localStorage.removeItem(label.value);
        allLabels.value = Object.keys(allItems);

        label.value = '';
        token.value = '';
        agent.value = '';
        grant.value = '';
        data.value = '';
        meta.value = '';
        credentials.value = '';
        statlist.value = '';
        uuid.value = '';
        filter.value = '';
    }
}

function startTimer()
{
    if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
    }
    isWaiting.value = false;

    timer.value = setInterval(callCheckApi, 2000);
}

const isWaiting = ref(false);
const status = ref('');
const requests = ref<any>([]);

async function callCheckApi()
{
    if (isWaiting.value === true) return;

    const url = agent.value + '/api/check-offer';
    isWaiting.value = true;
    const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ id: requestId.value }),
            headers: {"Content-Type": "application/json", "Authorization": "Bearer " + token.value}
        })
        .then((r) => r.json());
    isWaiting.value = false;
    status.value = response.status;
    requests.value = response.requests;
    uuid.value = response.uuid;

    if (response.status == 'CREDENTIAL_ISSUED') {
        clearInterval(timer.value);
        timer.value = null;
    }
}

const selectedPreset = ref('');
function selectPreset()
{
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets") || "{}");
    if (allItems[selectedPreset.value]) {
        const item = JSON.parse(localStorage.getItem(selectedPreset.value) || '{}');
        label.value = item.label;
        token.value = item.token;
        agent.value = item.agent;
        grant.value = item.grant;
        data.value = item.data;
        meta.value = item.meta;
        credentials.value = item.credential;
        statlist.value = item.statlist;
        filter.value = item.filter;
    }
}

async function revoke()
{
    if (isWaiting.value) {
        return;
    }
    if (uuid.value == '') {
        status.value = 'No credential UUID found';
    }
    else {
        const url = agent.value + '/api/revoke-credential';
        isWaiting.value = true;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ uuid: uuid.value, state: 'revoke', list: statlist.value }),
            headers: {"Content-Type": "application/json", "Authorization": "Bearer " + token.value}
        })
        .then((r) => r.json());

    
        isWaiting.value = false;
        status.value = response.status;
        requests.value = [response];
    }
}

async function unrevoke()
{
    if (isWaiting.value) {
        return;
    }
    if (uuid.value == '') {
        status.value = 'No credential UUID found';
    }
    else {
        const url = agent.value + '/api/revoke-credential';
        isWaiting.value = true;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ uuid: uuid.value, state: 'unrevoke', list: statlist.value }),
            headers: {"Content-Type": "application/json", "Authorization": "Bearer " + token.value}
        })
        .then((r) => r.json());

    
        isWaiting.value = false;
        status.value = response.status;
        requests.value = [response];
    }
}


async function listcreds()
{
    if (isWaiting.value) {
        return;
    }
    const url = agent.value + '/api/list-credentials';
    isWaiting.value = true;
    const response = await fetch(url, {
        method: 'POST',
        body: filter.value,
        headers: {"Content-Type": "application/json", "Authorization": "Bearer " + token.value}
    })
    .then((r) => r.json());
    
    isWaiting.value = false;
    requests.value = response;
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
                <el-form-item label="Token">
                    <el-input v-model="token" type="text"/>
                </el-form-item>
                <el-form-item label="Credential">
                    <el-input v-model="credentials" type="text"/>
                </el-form-item>
                <el-form-item label="Data">
                    <el-input v-model="data" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
                </el-form-item>
                <el-form-item label="Grant">
                    <el-input v-model="grant" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
                </el-form-item>
                <el-form-item label="Metadata">
                    <el-input v-model="meta" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
                </el-form-item>
                <el-form-item label="UUID">
                    <el-input v-model="uuid" type="text"/>
                </el-form-item>
                <el-form-item label="Filter">
                    <el-input v-model="filter" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
                </el-form-item>
            </el-collapse-item>
        </el-collapse>
        <el-form-item label="Actions">
            <el-button @click="generate">Generate</el-button>
            <el-button @click="remove">Delete</el-button>
            <el-button @click="revoke">Revoke</el-button>
            <el-button @click="unrevoke">Unrevoke</el-button>
            <el-button @click="listcreds">List Credentials</el-button>
        </el-form-item>
        <qrcode-vue :value="requestUri" :size="300"></qrcode-vue>
        <el-form-item label="Status">
            {{ status }}
        </el-form-item>
        <el-form-item label="Requests" class="requests">
            <div v-for="(r,i) in Object.keys(requests)" :key="i">
                <h4>{{ r }}</h4>
                <pre>{{ requests[r] }}</pre>
            </div>
        </el-form-item>
    </el-form>    
</template>