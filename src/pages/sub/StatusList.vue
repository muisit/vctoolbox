<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const label = ref('');
const agent = ref('');
const token = ref('');
const date = ref('');
const index = ref('');
const lst = ref('');
const value = ref('');
const mask = ref('-1');
const output = ref('');
const allLabels = ref<string[]>([]);
const timer = ref<any>(null);

onMounted(() => {
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets_status") || "{}");
    allLabels.value = Object.keys(allItems);
})

onUnmounted(() => {
    if (timer.value) {
        clearInterval(timer.value);
        timer.value = null;
    }
})

async function reserve()
{
    add();
    const url = agent.value + '/api/index';
    const request = {
        expirationDate: date.value
    };

    const response = await fetch(url, {
        method:'POST',
        body: JSON.stringify(request),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token.value
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response) {
        if (response.index) {
            index.value = response.index;
        }
        if (response.url) {
            lst.value = response.url;
        }
        output.value = JSON.stringify(response, null, 4);
    }
}

async function revoke()
{
    add();
    const url = agent.value + '/api/revoke';
    const request = {
        list: lst.value,
        index: index.value,
        status: parseInt(value.value) ? 'revoke' : 'unrevoke'
    };

    const response = await fetch(url, {
        method:'POST',
        body: JSON.stringify(request),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token.value
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response) {
        output.value = JSON.stringify(response, null, 4);
    }
}

async function setstatus()
{
    add();
    const url = agent.value + '/api/status';
    const request = {
        list: lst.value,
        index: index.value,
        status: parseInt(value.value),
        mask: parseInt(mask.value)
    };

    const response = await fetch(url, {
        method:'POST',
        body: JSON.stringify(request),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token.value
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response) {
        output.value = JSON.stringify(response, null, 4);
    }
}

async function getstatus()
{
    add();
    const pathvalues = lst.value.split('/');
    const listIndex = parseInt(pathvalues[pathvalues.length - 1]);
    const url = agent.value + '/api/status/' + listIndex + '/' + index.value;

    const response = await fetch(url, {
        method:'GET',
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token.value
        }
    }).then((r) => r.json()).catch((e) => { console.error(e); return null; });

    if (response) {
        output.value = JSON.stringify(response, null, 4);
    }
}

async function credential()
{
    add();
    const response = await fetch(lst.value, {
        method:'GET',
    });

    if (response) {
        output.value = await response.text();
    }
}

function add()
{
    const dataPackage = {
        label: label.value,
        agent: agent.value,
        token: token.value,
        date: date.value,
        index: index.value,
        value: value.value,
        mask: mask.value,
        lst: lst.value
    };
    localStorage.setItem(label.value, JSON.stringify(dataPackage));

    const allItems = JSON.parse(localStorage.getItem("toolbox_presets_status") || "{}");
    allItems[label.value] = label.value;
    localStorage.setItem("toolbox_presets_status", JSON.stringify(allItems));
    allLabels.value = Object.keys(allItems);
}

function remove()
{
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets_status") || "{}");
    if (allItems[label.value]) {
        delete allItems[label.value];
        localStorage.setItem("toolbox_presets_status", JSON.stringify(allItems));
        localStorage.removeItem(label.value);
        allLabels.value = Object.keys(allItems);

        label.value = '';
        token.value = '';
        agent.value = '';
        date.value = '';
        index.value = '';
        value.value = '';
        output.value = '';
        lst.value = '';
        mask.value = '';
    }
}

const selectedPreset = ref('');
function selectPreset()
{
    const allItems = JSON.parse(localStorage.getItem("toolbox_presets_status") || "{}");
    if (allItems[selectedPreset.value]) {
        const item = JSON.parse(localStorage.getItem(selectedPreset.value) || '{}');
        label.value = item.label;
        token.value = item.token;
        agent.value = item.agent;
        value.value = item.value;
        date.value = item.date;
        index.value = item.index;
        lst.value = item.lst;
        mask.value = item.mask;
    }
}

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
            <el-button @click="revoke">{{ parseInt(value) ? 'Revoke' : 'Unrevoke' }}</el-button>
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