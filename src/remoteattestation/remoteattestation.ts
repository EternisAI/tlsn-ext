const fs = require('fs');
import * as crypto from 'crypto';
import { chainCerts, ChainCert } from './chain-certs';

import * as cbor from 'cbor-web';

const certPath = './cert.pem';

interface RemoteAttestation {
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

    const remoteAttestation: RemoteAttestation = {
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
    console.log(decoded);
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
    const verifier = crypto.createVerify('SHA384');

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

async function verifyRemoteAttestation() {
  //fetch attestation
  // add axios code here..

  //parse cbor structure
  const base64String = fs.readFileSync('./remote_attestation', 'utf8');
  const remote_attestation_uint8 = Buffer.from(base64String, 'base64');
  const remote_attestation = decodeCbor(remote_attestation_uint8);

  if (!remote_attestation) return;

  const payload = decodeCborPayload(remote_attestation.payload);
  console.log(payload);

  if (!payload) return;

  //verify signature of attestation
  const publicKey = payload.public_key;

  const message = remote_attestation.payload;
  const signature = remote_attestation.signature;

  const isValid = verifyES384Signature(
    publicKey,
    new Uint8Array(message),
    signature,
  );
  console.log('signature', signature);
  console.log('publicKey', new Uint8Array(publicKey));
  console.log('Signature is valid:', isValid);

  //verify x509 certificate
  // if (verifyCertificate(certPath, chainCerts)) {
  //   console.log('====\n End Certificate is valid 🟢');
  // } else {
  //   console.log('====\n End Certificate verification failed 🚫');
  // }

  // verify PCR values
}
verifyRemoteAttestation();
