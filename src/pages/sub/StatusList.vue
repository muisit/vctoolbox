<script setup lang="ts">
import { useTokenStore } from '@/stores/token';
import { ref, onUnmounted } from 'vue';

const store = useTokenStore();
const preset = "statuslist";

const date = ref('');
const index = ref('');
const lst = ref('');
const value = ref('');
const mask = ref('-1');
const output = ref('');
const timer = ref<any>(null);

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
    }
})

async function reserve()
{
    add();
    const url = store.url + '/api/index';
    const request = {
        expirationDate: date.value
    };

    const response = await fetch(url, {
        method:'POST',
        body: JSON.stringify(request),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + store.token
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response) {
        if (response.index) {
            index.value = response.index;
        }
        if (response.url) {
            lst.value = response.url;
            if (lst.value.startsWith(store.url)) {
                lst.value = lst.value.substring(store.url.length + 1); // skip the url plus path delimiter
            }
        }
        output.value = JSON.stringify(response, null, 4);
        value.value = '0';
    }
}

async function revoke()
{
    add();
    const url = store.url + '/api/revoke';
    const request = {
        list: store.url + '/' + lst.value,
        index: index.value,
        status: parseInt(value.value) ? 'unrevoke' : 'revoke'
    };

    const response = await fetch(url, {
        method:'POST',
        body: JSON.stringify(request),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + store.token
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response) {
        output.value = JSON.stringify(response, null, 4);
        value.value = parseInt(value.value) ? '0' : '1';
    }
}

async function setstatus()
{
    add();
    const url = store.url + '/api/status';
    const request = {
        list: store.url + '/' + lst.value,
        index: index.value,
        status: parseInt(value.value),
        mask: parseInt(mask.value)
    };

    const response = await fetch(url, {
        method:'POST',
        body: JSON.stringify(request),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + store.token
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response) {
        output.value = JSON.stringify(response, null, 4);
    }
}

async function getstatus()
{
    add();
    const url = store.url + '/api/status/' + lst.value + '/' + index.value;

    const response = await fetch(url, {
        method:'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + store.token
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response) {
        output.value = JSON.stringify(response, null, 4);
        if (response.status === true) {
            value.value = '1';
        }
        else if (response.status === false) {
            value.value = '0';
        }
        else {
            value.value = '' + response.status;
        }
    }
}

async function credential()
{
    add();
    const response = await fetch(store.url + '/' + lst.value, {
        method:'GET',
    });

    if (response) {
        output.value = await response.text();
    }
}

function add()
{
    const dataPackage = {
        date: date.value,
        index: index.value,
        value: value.value,
        mask: mask.value,
        lst: lst.value
    };
    store.update(preset, store.agent, dataPackage);
}

function selectPreset()
{
    const item = store.load(preset, store.agent);
    if (item && Object.keys(item).length > 0) {
        value.value = item.value;
        date.value = item.date;
        index.value = item.index;
        lst.value = item.lst;
        mask.value = item.mask;
    }
}

import PresetHeader from '@/components/PresetHeader.vue';
</script>
<template>
    <el-form label-position="left" label-width="auto">
        <div><h1>Status List</h1><br/></div>
        <PresetHeader @on-select="selectPreset" :preset="preset" />
        <el-collapse>
            <el-collapse-item title="Details">
                <el-form-item label="URL">
                    <el-input v-model="store.url" type="text" disabled/>
                </el-form-item>
                <el-form-item label="List">
                    <el-input v-model="lst" type="text"/>
                </el-form-item>
                <el-form-item label="Index">
                    <el-input v-model="index" type="text"/>
                </el-form-item>
                <el-form-item label="Date">
                    <el-input v-model="date"  type="text"/>
                </el-form-item>
                <el-form-item label="Value">
                    <el-input v-model="value"  type="text"/>
                </el-form-item>
                <el-form-item label="Mask">
                    <el-input v-model="mask"  type="text"/>
                </el-form-item>
            </el-collapse-item>
        </el-collapse>
        <el-form-item label="Actions">
            <el-button @click="reserve">Reserve</el-button>
            <el-button @click="revoke">{{ parseInt(value) ? 'Unrevoke' : 'Revoke' }}</el-button>
            <el-button @click="setstatus">Set</el-button>
            <el-button @click="getstatus">Get</el-button>
            <el-button @click="credential">Credential</el-button>
            <el-button @click="remove">Delete</el-button>
        </el-form-item>
        <el-form-item label="Status">
            <pre>{{ output }}</pre>
        </el-form-item>
    </el-form>    
</template>