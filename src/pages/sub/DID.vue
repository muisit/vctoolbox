<script setup lang="ts">
import { ref } from 'vue';
import { Factory } from '@muisit/cryptokey';

const inputvalue = ref('');
const outputvalue = ref('');
const message = ref('');
const keytype=ref('');

function encodeValue() {
    message.value = '';
    inputvalue.value = '';
    try {
        // if the input string happens to be json, minify it first
        const key = Factory.createFromJWK(JSON.parse(outputvalue.value));
        if (keytype.value == 'did:key') {
            inputvalue.value = Factory.toDIDKey(key);
        }
        else {
            inputvalue.value = Factory.toDIDJWK(key);
        }
    }
    catch (e) {
        message.value = e.toString();
    }
}
async function decodeValue() {
    message.value = '';
    outputvalue.value = '';
    try {
        console.log('resolving ', inputvalue.value);
        const key = await Factory.resolve(inputvalue.value);
        console.log(key);
        if (key) {
            keytype.value = inputvalue.value.startsWith('did:key:') ? 'did:key' :
                                (inputvalue.value.startsWith('did:jwk:') ? 'did:jwk' : 
                            (inputvalue.value.startsWith('did:web:') ? 'did:web' : ''));
            outputvalue.value = JSON.stringify(key.toJWK(), null, 4);
        }
        else {
            message.value = "Could not decode key";
        }

        // if it is JSON, prettify it
        try {
            const jsonvalue = JSON.parse(outputvalue.value);
            if (jsonvalue && Object.keys(jsonvalue).length > 0) {
                outputvalue.value = JSON.stringify(jsonvalue, null, 4);
            }
        }
        catch (e) {
            message.value = e.toString();
        }
    }
    catch(e) {
        message.value = e.toString();
    }
}

</script>
<template>
    <div>
        <el-form label-position="left" label-width="auto">
            <el-form-item label="Encoded">
                <el-input v-model="inputvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="decodeValue"/>
            </el-form-item>
            <el-form-item label="JWK">
                <el-input v-model="outputvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="encodeValue"/>
            </el-form-item>
            <el-form-item label="Type">
                <el-select v-model="keytype">
                    <el-option value="">choose</el-option>
                    <el-option value="did:key">did:key</el-option>
                    <el-option value="did:jwk">did:jwk</el-option>
                    <el-option value="did:web">did:web</el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Message">
                <el-input v-model="message" :autosize="{minRows:3}" disabled/>
            </el-form-item>
        </el-form>    
    </div>
</template>