import { ref } from 'vue'
import type { Ref } from 'vue';
import { defineStore } from 'pinia'
import { CryptoKey, Factory } from '@muisit/cryptokey/*';
import { fromString, toString } from 'uint8arrays';
import { varint } from 'multiformats';

export const useDidStore = defineStore('did', () => {

    function resolveDid(didUrl:string)
    {
        const parts = didUrl.split(':', 2);
        if (parts[0] === 'did') {
            switch (parts[1]) {
                case 'key':
                    return resolveDidKey(didUrl);
                case 'jwk':
                    return resolveDidJwk(didUrl);
                case 'web':
                    return resolveDidWeb(didUrl);
            }
        }
        return {
            'type': null
        };
    }

    function resolveDidKey(didUrl:string)
    {
        // https://w3c-ccg.github.io/did-key-spec/
        const keyvalue = didUrl.substring(8);
        const keycode = keyvalue.split('#')[0];
        const bytestring = fromString(keycode, 'base58btc');
        const codec = varint.decode(bytestring);
        let key:CryptoKey|null = null;

        // https://github.com/multiformats/multicodec/blob/master/table.csv
        switch (codec[0]) {
            case 0xeb51: //      jwk_jcs-pub,                    key,            0xeb51,         draft,      JSON object containing only the required members of a JWK (RFC 7518 and RFC 7517) representing the public key. Serialisation based on JCS (RFC 8785)
                const jsonstring = toString(bytestring.slice(2), 'utf-8');
                const jsonobj = JSON.parse(jsonstring);
                if (jsonobj) {
                    key = Factory.createFromJWK(jsonobj);
                }
                break;
            case 0xec: //        x25519-pub,                     key,            0xec,           draft,      Curve25519 public key
            case 0xed: //        ed25519-pub,                    key,            0xed,           draft,      Ed25519 public key
            case 0xe7: //        secp256k1-pub,                  key,            0xe7,           draft,      Secp256k1 public key (compressed)
            case 0x1200: //      p256-pub,                       key,            0x1200,         draft,      P-256 public Key (compressed)
                key = Factory.createFromDidKey(didUrl);
                break;
            case 0xa0: //        aes-128,                        key,            0xa0,           draft,      128-bit AES symmetric key
            case 0xa1: //        aes-192,                        key,            0xa1,           draft,      192-bit AES symmetric key
            case 0xa2: //        aes-256,                        key,            0xa2,           draft,      256-bit AES symmetric key
            case 0xa3: //        chacha-128,                     key,            0xa3,           draft,      128-bit ChaCha symmetric key
            case 0xa4: //        chacha-256,                     key,            0xa4,           draft,      256-bit ChaCha symmetric key
            case 0xea: //        bls12_381-g1-pub,               key,            0xea,           draft,      BLS12-381 public key in the G1 field
            case 0xeb: //        bls12_381-g2-pub,               key,            0xeb,           draft,      BLS12-381 public key in the G2 field
            case 0xee: //        bls12_381-g1g2-pub,             key,            0xee,           draft,      BLS12-381 concatenated public keys in both the G1 and G2 fields
            case 0xef: //        sr25519-pub,                    key,            0xef,           draft,      Sr25519 public key
            case 0x1201: //      p384-pub,                       key,            0x1201,         draft,      P-384 public Key (compressed)
            case 0x1202: //      p521-pub,                       key,            0x1202,         draft,      P-521 public Key (compressed)
            case 0x1203: //      ed448-pub,                      key,            0x1203,         draft,      Ed448 public Key
            case 0x1204: //      x448-pub,                       key,            0x1204,         draft,      X448 public Key
            case 0x1205: //      rsa-pub,                        key,            0x1205,         draft,      RSA public key. DER-encoded ASN.1 type RSAPublicKey according to IETF RFC 8017 (PKCS #1)
            case 0x1206: //      sm2-pub,                        key,            0x1206,         draft,      SM2 public key (compressed)
            case 0x120b: //      mlkem-512-pub,                  key,            0x120b,         draft,      ML-KEM 512 public key; as specified by FIPS 203
            case 0x120c: //      mlkem-768-pub,                  key,            0x120c,         draft,      ML-KEM 768 public key; as specified by FIPS 203
            case 0x120d: //      mlkem-1024-pub,                 key,            0x120d,         draft,      ML-KEM 1024 public key; as specified by FIPS 203
            case 0x123a: //      multikey,                       multiformat,    0x123a,         draft,      Encryption key multiformat
            case 0x130c: //      bls12_381-g1-pub-share,         key,            0x130c,         draft,      BLS12-381 G1 public key share
            case 0x130d: //      bls12_381-g2-pub-share,         key,            0x130d,         draft,      BLS12-381 G2 public key share
            case 0x1a14: //      lamport-sha3-512-pub,           key,            0x1a14,         draft,      Lamport public key based on SHA3-512
            case 0x1a15: //      lamport-sha3-384-pub,           key,            0x1a15,         draft,      Lamport public key based on SHA3-384
            case 0x1a16: //      lamport-sha3-256-pub,           key,            0x1a16,         draft,      Lamport public key based on SHA3-256
            case 0xa000: //      chacha20-poly1305,              multikey,       0xa000,         draft,      ChaCha20_Poly1305 encryption scheme
                throw new Error("not implemented");
            default:
                throw new Error("not a proper public key");
        }

        // Set the verificationMethod.id value by concatenating identifier, a hash character (#), and the multicodecValue
        const keyId = didUrl + '#' + keyvalue;
        let verificationMethod:any = {
            "id": keyId,
            // Set verificationMethod.controller to the identifier value
            "controller": keyId,
        };
        switch (key!.keyType) {
            case 'Ed25519':
            case 'X25519':
            case 'Secp256r1':
            case 'Secp256k1':
                verificationMethod.publicKeyFormat = 'Multikey';
                verificationMethod.publickeyMultibase = keyvalue;
                break;
            default:
                verificationMethod.publicKeyFormat = 'JsonWebKey';
                verificationMethod.publicKeyJwk = key!.toJWK();
                break;
        }
        let diddoc:any = {
            "@context": [
                "https://www.w3.org/ns/did/v1",
            ],
            id: didUrl,
            verificationMethod: [verificationMethod],
              "authentication": [keyId],
              "assertionMethod": [keyId],
              "capabilityDelegation": [keyId],
              "capabilityInvocation": [keyId]
        };

        if (key!.keyType == 'X25519') {
            diddoc.keyAgreement = [verificationMethod];
        };

        return {
            type: 'did:key',
            key: key,
            didDocument: diddoc
        };
    }

    function resolveDidJwk(keyvalue:string)
    {

    }

    function resolveDidWeb(keyvalue:string)
    {

    }

    return {
        resolveDid
    }
});
