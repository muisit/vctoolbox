<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import { useTokenStore } from '@/stores/token';

const store = useTokenStore();
const preset = "issuer";

const credentials = ref('');
const data = ref('');
const meta = ref('');
const grant = ref('');
const requestId = ref('');
const requestUri = ref('');
const uuid = ref('');
const statlist = ref('');
const filter = ref('');
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
        credential: credentials.value,
        data: data.value,
        meta: meta.value,
        grant: grant.value,
        statlist: statlist.value,
        filter: filter.value
    };
    store.update(preset, store.agent, dataPackage);
}

async function generate()
{
    updateDataInStore();
    const url = store.url + '/api/create-offer';
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
    if (meta.value && meta.value.trim() != '') {
        try {
            request.credentialMetadata = JSON.parse(meta.value);
        }
        catch (e) {
            // skip the metadata
        }
    }

    requests.value = [];
    const response = await fetch(url, {
        method:'POST',
        body: JSON.stringify(request),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + store.token
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response && response.uri && response.id) {
        requestId.value = response.id;
        requestUri.value = response.uri;

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

    timer.value = setInterval(callCheckApi, 2000);
}

const isWaiting = ref(false);
const status = ref('');
const requests = ref<any>([]);

async function callCheckApi()
{
    if (isWaiting.value === true) return;

    const url = store.url + '/api/check-offer';
    isWaiting.value = true;
    const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ id: requestId.value }),
            headers: {"Content-Type": "application/json", "Authorization": "Bearer " + store.token}
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

function selectPreset()
{
    const item = store.load(preset, store.agent);
    if (item && Object.keys(item).length > 0) {
        grant.value = item.grant ?? '{}';
        data.value = item.data || '{}';
        meta.value = item.meta || '';
        credentials.value = item.credential || '';
        statlist.value = item.statlist || '';
        filter.value = item.filter || '';
    }
}

async function revoke()
{
    updateDataInStore();
    if (isWaiting.value) {
        return;
    }
    if (uuid.value == '') {
        status.value = 'No credential UUID found';
    }
    else {
        const url = store.url + '/api/revoke-credential';
        isWaiting.value = true;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ uuid: uuid.value, state: 'revoke', list: statlist.value }),
            headers: {"Content-Type": "application/json", "Authorization": "Bearer " + store.token}
        })
        .then((r) => r.json());
    
        isWaiting.value = false;
        status.value = response.status;
        requests.value = [response];
    }
}

async function unrevoke()
{
    updateDataInStore();
    if (isWaiting.value) {
        return;
    }
    if (uuid.value == '') {
        status.value = 'No credential UUID found';
    }
    else {
        const url = store.url + '/api/revoke-credential';
        isWaiting.value = true;
        const response = await fetch(url, {
            method: 'POST',
            body: JSON.stringify({ uuid: uuid.value, state: 'unrevoke', list: statlist.value }),
            headers: {"Content-Type": "application/json", "Authorization": "Bearer " + store.token}
        })
        .then((r) => r.json());

        isWaiting.value = false;
        status.value = response.status;
        requests.value = [response];
    }
}

async function listcreds()
{
    updateDataInStore();
    if (isWaiting.value) {
        return;
    }
    const url = store.url + '/api/list-credentials';
    isWaiting.value = true;
    const response = await fetch(url, {
        method: 'POST',
        body: filter.value,
        headers: {"Content-Type": "application/json", "Authorization": "Bearer " + store.token}
    })
    .then((r) => r.json());
    
    isWaiting.value = false;
    requests.value = response;
}

import QrcodeVue from 'qrcode.vue'
import PresetHeader from '@/components/PresetHeader.vue';
</script>
<template>
    <el-form label-position="left" label-width="auto">
        <div><h1>Issuer</h1><br/></div>
        <PresetHeader @on-select="selectPreset" :preset="preset" />
        <el-collapse>
            <el-collapse-item title="Details">
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