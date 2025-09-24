<script setup lang="ts">
import { ref } from 'vue';
import { fromString, toString } from "uint8arrays";
import { CryptoKey, Factory } from '@muisit/cryptokey';
import { JWT } from '@muisit/simplejwt';

const inputvalue = ref('');
const headervalue = ref('');
const payloadvalue = ref('');
const signaturevalue = ref('');
const didvalue = ref('');
const message = ref('');

async function encodeValue() {
    message.value = '';
    try {
        const jwt = new JWT();
        jwt.header = JSON.parse(headervalue.value);
        jwt.payload = JSON.parse(payloadvalue.value);

        if (didvalue.value != '') {
            try {
                console.log('resolving didvalue ', didvalue.value);
                const els = didvalue.value.split(':');
                const ckey = await Factory.createFromType(els[0], els[1]);
                if (ckey) {
                    console.log('signing jwt using', ckey.algorithms()[0]);
                    await jwt.sign(ckey, ckey.algorithms()[0]);
                    console.log('jwt signature is ', jwt.signaturePart);
                }
            }
            catch (e:any) {
                message.value = 'Caught error creating signature: ' + e;
            }
        }
        else {
            jwt.headerPart = jwt.encodeToBase64(jwt.header || {});
            jwt.payloadPart = jwt.encodeToBase64(jwt.payload || {});
            jwt.signaturePart = signaturevalue.value;
        }
        inputvalue.value = jwt.headerPart + '.' + jwt.payloadPart + '.' + jwt.signaturePart;
        signaturevalue.value = jwt.signaturePart;
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
                console.log('resolving iss', payload.iss);
                key = await Factory.resolve(payload.iss);
            }
            catch (e:any) {
                console.log(e);
                try {
                    console.log('resolving kid', header.kid);
                    const kid = (header.kid ?? '').split('#')[0];
                    key = await Factory.resolve(kid);
                }
                catch (e) {
                    console.log(e);
                }
            }

            if (key !== null) {
                console.log('trying to verify using ', header.alg);
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
            <el-form-item label="Private key">
                <el-input v-model="didvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}" @blur="encodeValue"/>
            </el-form-item>
            <el-form-item label="Message">
                <el-input v-model="message" :autosize="{minRows:3}" disabled/>
            </el-form-item>
        </el-form>    
    </div>
</template>