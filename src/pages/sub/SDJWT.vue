<script setup lang="ts">
import { ref } from 'vue';
import { fromString, toString } from "uint8arrays";
import { CryptoKey, Factory } from '@muisit/cryptokey';
import { sha256 } from '@noble/hashes/sha2'

interface DisclosedAttribute {
    salt: string;
    key: string;
    value: string;
    hash?: string;
    path?: string[];
}

const inputvalue = ref('');
const headervalue = ref('');
const payloadvalue = ref('');
const signaturevalue = ref('');
const message = ref('');
const disclosureFrame = ref<DisclosedAttribute[]>([]);

async function decodeValue() {
    message.value = '';
    try {
        const parts = inputvalue.value.split('.');
        if (parts && parts.length == 3) {
            const lastPart = parts[2].split('~');
            signaturevalue.value = lastPart[0];
            const disclosedEncoded = lastPart.slice(1);
            disclosureFrame.value = [];
            for (const de of disclosedEncoded) {
                if (de.length > 0) {
                    const content = JSON.parse(toString(fromString(de,'base64url'),'utf-8'));
                    console.log(content);
                    disclosureFrame.value.push({
                        salt: content[0],
                        key: content[1],
                        value: content[2],
                        hash: toString(sha256(de), 'base64url')
                    });
                }
            }

            const headerPart = toString(fromString(parts[0], 'base64url'), 'utf-8');
            const payloadPart = toString(fromString(parts[1], 'base64url'), 'utf-8');

            const header = JSON.parse(headerPart);
            headervalue.value = JSON.stringify(header, null, 4);
            const payload = JSON.parse(payloadPart);
            payloadvalue.value = JSON.stringify(payload, null, 4);

            let key:CryptoKey|null = null;
            try {
                console.log('trying to resolve ', payload.iss);
                key = await Factory.resolve(payload.iss);
            }
            catch (e) {
                console.log('Catch on iss: ', e);
                try {
                    console.log('trying to resolve ', header.kid);
                    key = await Factory.resolve(header.kid);
                }
                catch (e) {
                    console.log('Catch on kid', e);
                }
            }
            
            if (key !== null) {
                console.log('verifying data', header.alg);
                if (!key.verify(header.alg, fromString(signaturevalue.value, 'base64url'), fromString(parts[0] + '.' + parts[1], 'utf-8'))) {
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
    catch(e) {
        console.log('overall catch', e);
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
                <el-input v-model="headervalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
            </el-form-item>
            <el-form-item label="Payload">
                <el-input v-model="payloadvalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
            </el-form-item>
            <el-form-item label="Disclosure" class="disclosed">
                <table>
                    <tbody>
                        <tr v-for="frame in disclosureFrame" :key="frame.key">
                            <td>{{ frame.key }}</td>
                            <td>{{ frame.value }}</td>
                            <td>{{ frame.salt }}</td>
                            <td>{{ frame.hash }}</td>
                            <td>{{  JSON.stringify(frame.path) }}</td>
                        </tr>
                    </tbody>
                </table>
            </el-form-item>
            <el-form-item label="Signature">
                <el-input v-model="signaturevalue" :rows="5" type="textarea" :autosize="{minRows:5, maxRows:15}"/>
            </el-form-item>
            <el-form-item label="Message">
                <el-input v-model="message" :autosize="{minRows:3}" disabled/>
            </el-form-item>
        </el-form>    
    </div>
</template>