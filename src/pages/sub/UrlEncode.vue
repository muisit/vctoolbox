<script setup lang="ts">
import { ref } from 'vue';

const inputvalue = ref('');
const outputvalue = ref('');
const message = ref('');

function encodeValue() {
    message.value = '';
    outputvalue.value = '';
    try {
        // if the input string happens to be json, minify it first
        let value = inputvalue.value;
        try {
            const jsonobject = JSON.parse(value);
            if (jsonobject && Object.keys(jsonobject).length > 0) {
                value = JSON.stringify(jsonobject);
            }
        }
        catch (e) {
            message.value = e.toString();
        }

        outputvalue.value = encodeURIComponent(value);
    }
    catch (e) {
        message.value = e.toString();
    }
}
function decodeValue() {
    message.value = '';
    inputvalue.value = '';
    try {
        inputvalue.value = decodeURIComponent(outputvalue.value.trim());

        // if it is JSON, prettify it
        try {
            const jsonvalue = JSON.parse(inputvalue.value);
            if (jsonvalue && Object.keys(jsonvalue).length > 0) {
                inputvalue.value = JSON.stringify(jsonvalue, null, 4);
            }
        }
        catch (e) {
            message.value = e.toString();
        }
    }
    catch(e) {
        message.value = e.toString();

        // if there is an illegal character, try to find it
        for (var i = 0; i < outputvalue.value.length;i++) {

        }
    }
}

</script>
<template>
    <div>
        <el-form label-position="left" label-width="auto">
            <el-form-item label="Decoded">
                <el-input v-model="inputvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="encodeValue"/>
            </el-form-item>
            <el-form-item label="Encoded">
                <el-input v-model="outputvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="decodeValue"/>
            </el-form-item>
            <el-form-item label="Message">
                <el-input v-model="message" :autosize="{minRows:3}" disabled/>
            </el-form-item>
        </el-form>    
    </div>
</template>