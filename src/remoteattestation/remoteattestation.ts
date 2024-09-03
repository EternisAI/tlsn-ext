const fs = require('fs');
import * as crypto from 'crypto';
import { chainCerts, ChainCert } from './chain-certs';

import * as cbor from 'cbor-web';

import * as jws from 'jws';
import * as jwa from 'jwa';

const certPath = './cert.pem';

interface RemoteAttestation {
  protected: Buffer;
  unprotected: Buffer;
  payload: Buffer;
  signature: Uint8Array;
}

interface Payload {
  module_id: string;
  timestamp: number;
  digest: string;
  pcrs: Uint8Array[];
  certificate: Uint8Array;
  cabundle: Uint8Array[];
  public_key: Buffer;
  user_data: Uint8Array | null;
  nonce: Uint8Array | null;
}

function verifyCertificate(certPath: string, chainCerts: ChainCert[]) {
  // Read the certificate and CA certificate

  //enclave certificate
  let cert = new crypto.X509Certificate(fs.readFileSync(certPath));

  //1st certificate is ec2 instance certificate
  // final certificate is the root certificate
  let result = true;
  for (let i = 0; i < chainCerts.length; i++) {
    const ca = new crypto.X509Certificate(chainCerts[i].Cert);
    const result_ = cert.verify(ca.publicKey);

    result = result && result_;
    cert = ca;
  }

  // console.log('Subject:', cert.subject);
  // console.log('Issuer:', cert.issuer);
  // console.log('Valid from:', cert.validFrom);
  // console.log('Valid to:', cert.validTo);
  // console.log('publicKey:', cert.publicKey);
  return result;
}

function decodeCbor(data: Buffer) {
  try {
    const decoded = cbor.decodeAllSync(data);

    console.log(decoded);
    const remoteAttestation: RemoteAttestation = {
      protected: decoded[0][0],
      unprotected: decoded[0][1],
      payload: decoded[0][2],
      signature: new Uint8Array(decoded[0][3]),
    };
    return remoteAttestation;
  } catch (e: any) {
    console.log('Error decoding CBOR attestation', e.toString());
    return null;
  }
}

function decodeCborPayload(data: Buffer) {
  try {
    const decoded = cbor.decodeAllSync(data);
    const payload = decoded[0] as Payload;
    return payload;
  } catch (e: any) {
    console.log('Error decoding CBOR payload', e.toString());
    return undefined;
  }
}

function verifyES384Signature(
  publicKey: Buffer,
  message: Uint8Array,
  signature: Uint8Array,
) {
  try {
    // Create a verifier object
    const verifier = crypto.createVerify('ES384');

    // Add the message to be verified
    verifier.update(message);

    // Verify the signature
    const isValid = verifier.verify(publicKey, signature);

    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

function uint8ArrayToBase64(uint8Array: Uint8Array) {
  return Buffer.from(uint8Array).toString('base64');
}

async function verifyRemoteAttestation() {
  //fetch attestation
  // add axios code here..

  //parse cbor structure
  const base64String = fs.readFileSync('./remote_attestation', 'utf8');
  const remote_attestation_uint8 = Buffer.from(base64String, 'base64');
  const remote_attestation = decodeCbor(remote_attestation_uint8);

  if (!remote_attestation) return;

  const payload = decodeCborPayload(remote_attestation.payload);
  // console.log(payload);

  if (!payload) return;

  //verify signature of attestation

  const cert = new crypto.X509Certificate(payload.certificate);
  const publicKey = cert.publicKey.export({ type: 'spki', format: 'der' });
  const signature = remote_attestation.signature;

  const sig_structure = new Uint8Array([
    // ...new Uint8Array([132, 106]),
    // ...Buffer.from('Signature1'),
    // ...new Uint8Array(remote_attestation.protected),
    // ...new Uint8Array(),
    //@test : replace here with above data in DER format with type prefixes
    ...new Uint8Array([
      132, 106, 83, 105, 103, 110, 97, 116, 117, 114, 101, 49, 68, 161, 1, 56,
      34, 64, 89, 17, 93,
    ]),
    ...new Uint8Array(remote_attestation.payload),
  ]);

  //hash message
  const hash = crypto.createHash('sha384');
  hash.update(sig_structure);
  const hashedMessage = hash.digest();

  fs.writeFileSync('sig_structure', sig_structure.toString());

  console.log(
    'publicKey',
    new Uint8Array(publicKey),
    new Uint8Array(publicKey).slice(110, 120),
  );
  console.log('Digest:', new Uint8Array(hashedMessage));

  const base64Signature = uint8ArrayToBase64(signature);
  console.log('Base64 Signature:', base64Signature);

  const base64payload = uint8ArrayToBase64(new Uint8Array(hashedMessage));
  console.log('Base64 Payload:', base64payload);

  //verify signature
  console.log('publicKey', cert.publicKey);
  const ecdsa = jwa('ES384');
  const verify = ecdsa.verify(base64payload, base64Signature, cert.publicKey);
  console.log('verified:', verify);

  //@test

  //@todo
  //verify x509 certificate
  // if (verifyCertificate(certPath, chainCerts)) {
  //   console.log('====\n End Certificate is valid 🟢');
  // } else {
  //   console.log('====\n End Certificate verification failed 🚫');
  // }

  //@todo verify PCR values

  //@todo verify nonce
}
verifyRemoteAttestation();

function testJWA() {
  console.log('_____________\ntestVerifyES384');

  const privkeyStr = `-----BEGIN PRIVATE KEY-----
MIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDCAHpFQ62QnGCEvYh/p
E9QmR1C9aLcDItRbslbmhen/h1tt8AyMhskeenT+rAyyPhGhZANiAAQLW5ZJePZz
MIPAxMtZXkEWbDF0zo9f2n4+T1h/2sh/fviblc/VTyrv10GEtIi5qiOy85Pf1RRw
8lE5IPUWpgu553SteKigiKLUPeNpbqmYZUkWGh3MLfVzLmx85ii2vMU=
-----END PRIVATE KEY-----
`;

  const publicKey = crypto.createPublicKey(privkeyStr);

  const ecdsa = jwa('ES384');
  const input = 'very important stuff';

  const signature = ecdsa.sign(input, privkeyStr);
  console.log('signature', signature);
  const res = ecdsa.verify(input, signature, publicKey); // === true
  console.log(res);
}

//testJWA();
