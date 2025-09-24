<script setup lang="ts">
import { ref } from 'vue';
import { Factory } from '@muisit/cryptokey';

const inputvalue = ref('');
const outputvalue = ref('');
const message = ref('');
const keytype=ref('');
const enctype = ref('');
const privkey = ref('');

async function encodeValue() {
    message.value = '';
    inputvalue.value = '';
    try {
        // if the input string happens to be json, minify it first
        const key = await Factory.createFromJWK(JSON.parse(outputvalue.value));
        if (keytype.value == 'did:key') {
            inputvalue.value = await Factory.toDIDKey(key);
        }
        else {
            inputvalue.value = await Factory.toDIDJWK(key);
        }
    }
    catch (e:any) {
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
            outputvalue.value = JSON.stringify(await key.toJWK(), null, 4);
        }
        else {
            message.value = "Could not decode key";
        }
    }
    catch(e:any) {
        message.value = e.toString();
    }
}

async function create()
{
    if (enctype.value != '') {
        const ckey = await Factory.createFromType(enctype.value);
        await ckey.createPrivateKey();
        privkey.value = enctype.value + ':' + ckey.exportPrivateKey();
        outputvalue.value = JSON.stringify(await Factory.toJWK(ckey), null, 2);
        await encodeValue();
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
            <el-form-item label="Private key">
                <el-input v-model="privkey" :autosize="{minRows:3}" disabled/>
            </el-form-item>
            <el-form-item label="Type">
                <el-select v-model="keytype">
                    <el-option value="">choose</el-option>
                    <el-option value="did:key">did:key</el-option>
                    <el-option value="did:jwk">did:jwk</el-option>
                    <el-option value="did:web">did:web</el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Enc">
                <el-select v-model="enctype">
                    <el-option value="">choose</el-option>
                    <el-option value="Secp256r1">Secp256R1/P-256</el-option>
                    <el-option value="Secp256k1">Secp256K1</el-option>
                    <el-option value="Ed25519">Ed25519</el-option>
                    <el-option value="RSA">RSA 2048</el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Message">
                <el-input v-model="message" type="textarea" :autosize="{minRows:3}" disabled/>
            </el-form-item>
            <el-button @click="create">Create</el-button>
        </el-form>    
    </div>
</template>