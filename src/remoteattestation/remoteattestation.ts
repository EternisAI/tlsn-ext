const fs = require('fs');
import * as crypto from 'crypto';
import { chainCerts } from './chain-certs';

function verifyCertificate(certPath: string) {
  // Read the certificate and CA certificate

  const cert = new crypto.X509Certificate(fs.readFileSync(certPath));
  const ca = new crypto.X509Certificate(chainCerts[1].Cert);

  // Verify the certificate

  const result = cert.verify(ca.publicKey);

  console.log('Subject:', cert);

  // console.log('Subject:', cert.subject);
  // console.log('Issuer:', cert.issuer);
  // console.log('Valid from:', cert.validFrom);
  // console.log('Valid to:', cert.validTo);
  // console.log('publicKey:', cert.publicKey);

  if (result) {
    console.log('====\n Certificate is valid 🟢');
  } else {
    console.log('====\nCertificate verification failed 🚫');
  }
}

// Usage
const certPath = './cert.pem';
const caPath = './ca.pem';

verifyCertificate(certPath);
