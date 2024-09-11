const fs = require('fs');
import * as crypto from 'crypto';
import { chainCerts, ChainCert } from './chain-certs';

import * as cbor from 'cbor-web';

const certPath = './cert.pem';

interface RemoteAttestation {
  protected: Uint8Array;
  unprotected: Uint8Array;
  payload: Uint8Array;
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
      protected: new Uint8Array(decoded[0][0]),
      unprotected: new Uint8Array(decoded[0][1]),
      payload: new Uint8Array(decoded[0][2]),
      signature: new Uint8Array(decoded[0][3]),
    };
    return remoteAttestation;
  } catch (e: any) {
    console.log('Error decoding CBOR attestation', e.toString());
    return null;
  }
}

function decodeCborPayload(data: Uint8Array) {
  try {
    const decoded = cbor.decodeAllSync(data);
    const payload = decoded[0] as Payload;
    return payload;
  } catch (e: any) {
    console.log('Error decoding CBOR payload', e.toString());
    return undefined;
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

  let certificate_bytes = new Uint8Array(payload.certificate);
  //console.log('payload.certificate', new Uint8Array(payload.certificate));

  //@todo verify signature by calling wasm
  console.log(
    'payload',
    remote_attestation.payload,
    remote_attestation.payload.slice(-10),
  );
  console.log('signature', remote_attestation.signature);
  console.log('protected', remote_attestation.protected);
  console.log(
    'payload.certificate',
    certificate_bytes,
    certificate_bytes.slice(-10),
  );

  const str =
    'let protected="' +
    uint8ArrayToBase64(remote_attestation.protected) +
    '";\nlet payload="' +
    uint8ArrayToBase64(remote_attestation.payload) +
    '";\nlet signature="' +
    uint8ArrayToBase64(remote_attestation.signature) +
    '";\nlet certificate="' +
    uint8ArrayToBase64(certificate_bytes) +
    '";';

  fs.writeFileSync('./out/decoded', str);

  //@todo verify PCR values

  //@todo verify nonce
}
verifyRemoteAttestation();
