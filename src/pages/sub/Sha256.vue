<script setup lang="ts">
import { ref } from 'vue';
import { fromString, toString } from "uint8arrays";
import { sha256 } from '@noble/hashes/sha2';

const inputvalue = ref('');
const outputHexvalue = ref('');
const outputB64Urlvalue = ref('');
const message = ref('');

function encodeValue() {
    message.value = '';
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

        outputHexvalue.value = toString(sha256(value), 'base16');
        outputB64Urlvalue.value = toString(sha256(value), 'base64url');
    }
    catch (e) {
        message.value = e.toString();
    }
}
</script>
<template>
    <div>
        <el-form label-position="left" label-width="auto">
            <el-form-item label="Decoded">
                <el-input v-model="inputvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="encodeValue"/>
            </el-form-item>
            <el-form-item label="Encoded (Hex)">
                <el-input v-model="outputHexvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
            </el-form-item>
            <el-form-item label="Encoded (base64url)">
                <el-input v-model="outputB64Urlvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
            </el-form-item>
            <el-form-item label="Message">
                <el-input v-model="message" :autosize="{minRows:3}" disabled/>
            </el-form-item>
        </el-form>    
    </div>
</template>