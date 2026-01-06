<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue';

const version = getCurrentInstance()?.appContext.config.globalProperties.versionNumber;
const pageName = ref('main');
const handleSelect = (key: string, keyPath: string[]) => {
  console.log(key);
  switch (key) {
    case 'convertors':
    case 'jwt':
    case 'sha256':
    case 'base58btc':
    case 'base64':
    case 'base64url':
    case 'urlencode':
    case 'did':
    case 'issuer':
    case 'verifier':
    case 'statuslist':
    case 'sdjwt':
        pageName.value = key;
        break;
    default:
        pageName.value = 'main';
        break;
  }
}

import Main from './sub/Main.vue';
import Sha256 from './sub/Sha256.vue';
import Base58btc from './sub/Base58btc.vue';
import Base64 from './sub/Base64.vue';
import Base64Url from './sub/Base64Url.vue';
import UrlEncode from './sub/UrlEncode.vue';
import JWT from './sub/JWT.vue';
import DID from './sub/DID.vue';
import Issuer from './sub/Issuer.vue';
import Verifier from './sub/Verifier.vue';
import SDJWT from './sub/SDJWT.vue';
import StatusList from './sub/StatusList.vue';
</script>
<template>
    <el-container class="main">
        <el-header><div class='version'>{{ version }}</div></el-header>
        <el-container>
            <el-aside>
                <el-menu
                    default-active="2"
                    class="el-menu-vertical-demo"
                    @select="handleSelect"
                >
                    <el-sub-menu index="convertors">
                        <template #title>
                            <el-icon><menu /></el-icon>
                            <span>Convertors</span>
                        </template>
                        <el-menu-item index="sha256">Sha256</el-menu-item>
                        <el-menu-item index="base58btc">Base58btc</el-menu-item>
                        <el-menu-item index="base64">Base64</el-menu-item>
                        <el-menu-item index="base64url">Base64 URL</el-menu-item>
                        <el-menu-item index="urlencode">URLEncode</el-menu-item>
                        <el-menu-item index="jwt">JWT</el-menu-item>
                        <el-menu-item index="sdjwt">SDJWT</el-menu-item>
                        <el-menu-item index="did">DID</el-menu-item>
                    </el-sub-menu>
                    <el-menu-item index="issuer">Issuer</el-menu-item>
                    <el-menu-item index="verifier">Verifier</el-menu-item>
                    <el-menu-item index="statuslist">StatusList</el-menu-item>
                </el-menu>                
            </el-aside>
            <el-main>
                <Main v-if="pageName == 'main'" />
                <Sha256 v-if="pageName == 'sha256'" />
                <Base58btc v-if="pageName == 'base58btc'" />
                <Base64 v-if="pageName == 'base64'" />
                <Base64Url v-if="pageName == 'base64url'" />
                <UrlEncode v-if="pageName == 'urlencode'" />
                <JWT v-if="pageName == 'jwt'" />
                <DID v-if="pageName == 'did'" />
                <Issuer v-if="pageName == 'issuer'" />
                <Verifier v-if="pageName == 'verifier'" />
                <StatusList v-if="pageName == 'statuslist'" />
                <SDJWT v-if="pageName == 'sdjwt'" />
            </el-main>
        </el-container>
        <el-footer>

        </el-footer>
    </el-container>
</template>