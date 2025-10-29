import { ref } from 'vue'
import type { Ref } from 'vue';
import { defineStore } from 'pinia'

export const useTokenStore = defineStore('token', () => {
    const token:Ref<string> = ref('');
    const url:Ref<string> = ref('');
    const agent:Ref<string> = ref('');

    function update(type:string, agent:string, data:any)
    {
        const config = getConfig(type);
        config[agent] = Object.assign({}, config[agent], data);
        setConfig(type, config);
    }

    function remove(type:string, agent:string)
    {
        const config = getConfig(type);
        if (config[agent]) {
            delete config[agent];
        }
        setConfig(type, config);
    }

    function load(type: string, agentName:string)
    {
        const config = getConfig(type);
        agent.value = agentName;
        token.value = '';
        url.value = '';
        
        if (config[agentName]) {
            token.value = config[agentName].token;
            url.value = config[agentName].url;
            return config[agent.value];
        }
        return {};
    }

    function allAgents(type:string)
    {
        const config = getConfig(type);
        return Object.keys(config);
    }

    function setConfig(type:string, cfg:any)
    {
        localStorage.setItem("vctoolbox_" + type, JSON.stringify(cfg));
    }

    function getConfig(type:string)
    {
        return JSON.parse(localStorage.getItem("vctoolbox_" + type) || "{}");
    }

    return {
        load, update, remove, allAgents, agent, token, url
    }
});


