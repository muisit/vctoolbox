<script setup lang="ts">
import { ref } from 'vue';
import { fromString, toString } from "uint8arrays";
import { CryptoKey, Factory } from '@muisit/cryptokey';

const inputvalue = ref('');
const headervalue = ref('');
const payloadvalue = ref('');
const signaturevalue = ref('');
const message = ref('');

function encodeValue() {
    message.value = '';
    try {
        const recodedHeader = JSON.stringify(JSON.parse(headervalue.value));
        const headerpart = toString(fromString(recodedHeader, 'utf-8'), 'base64url');

        const recodedPayload = JSON.stringify(JSON.parse(payloadvalue.value));
        const payloadpart = toString(fromString(recodedPayload, 'utf-8'), 'base64url');

        inputvalue.value = headerpart + '.' + payloadpart + '.' + signaturevalue.value;
    }
    catch (e:any) {
        message.value = e.toString();
    }
}
async function decodeValue() {
    message.value = '';
    try {
        // get rid of all lws
        const token = inputvalue.value.replace(/\s+/g, '');
        const parts = token.match(/^([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)\.([a-zA-Z0-9_-]+)$/);
        if (parts && parts.length == 4) {
            signaturevalue.value = parts[3];

            const headerPart = toString(fromString(parts[1], 'base64url'), 'utf-8');
            const payloadPart = toString(fromString(parts[2], 'base64url'), 'utf-8');

            const header = JSON.parse(headerPart);
            headervalue.value = JSON.stringify(header, null, 4);
            const payload = JSON.parse(payloadPart);
            payloadvalue.value = JSON.stringify(payload, null, 4);

            // see if we can find a signature key
            let key:CryptoKey|null = null;
            try {
                key = await Factory.resolve(payload.iss);
            }
            catch (e:any) {
                console.log(e);
                try {
                    key = await Factory.resolve(header.kid);
                }
                catch (e) {
                    console.log(e);
                }
            }

            if (key !== null) {
                if (!key.verify(header.alg, fromString(parts[3], 'base64url'), fromString(parts[1] + '.' + parts[2], 'utf-8'))) {
                    message.value = "Key found, but signature not validated";
                }
                else {
                    message.value = "Key found, signature valid";
                }
            }
            else {
                message.value = "Could not determine key";
            }
        }
    }
    catch(e:any) {
        message.value = e.toString();
    }
}

</script>
<template>
    <div>
        <el-form label-position="left" label-width="auto">
            <el-form-item label="Token">
                <el-input v-model="inputvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="decodeValue"/>
            </el-form-item>
            <el-form-item label="Header">
                <el-input v-model="headervalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="encodeValue"/>
            </el-form-item>
            <el-form-item label="Payload">
                <el-input v-model="payloadvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="encodeValue"/>
            </el-form-item>
            <el-form-item label="Signature">
                <el-input v-model="signaturevalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="encodeValue"/>
            </el-form-item>
            <el-form-item label="Message">
                <el-input v-model="message" :autosize="{minRows:3}" disabled/>
            </el-form-item>
        </el-form>    
    </div>
</template>