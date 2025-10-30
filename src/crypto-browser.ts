export const createPublicKey = async () => false;
export const createPrivateKey = async () => false;
export const createECDH = async () => false;
export const subtle = {
    sign: async () => false,
    verify: async() => false
}

export default {
    createPrivateKey,
    createPublicKey,
    createECDH,
    subtle
};