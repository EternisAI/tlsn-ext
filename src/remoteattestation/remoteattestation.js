"use strict";
exports.__esModule = true;
var fs = require('fs');
var crypto = require("crypto");
var chain_certs_1 = require("./chain-certs");
function verifyCertificate(certPath, caPath) {
    // Read the certificate and CA certificate
    var cert = new crypto.X509Certificate(fs.readFileSync(certPath));
    var ca = new crypto.X509Certificate(chain_certs_1.chainCerts[1].Cert);
    // Verify the certificate
    var result = cert.verify(ca.publicKey);
    console.log('Subject:', cert);
    // console.log('Subject:', cert.subject);
    // console.log('Issuer:', cert.issuer);
    // console.log('Valid from:', cert.validFrom);
    // console.log('Valid to:', cert.validTo);
    // console.log('publicKey:', cert.publicKey);
    if (result) {
        console.log('====\n Certificate is valid 🟢');
    }
    else {
        console.log('====\nCertificate verification failed 🚫');
    }
}
// Usage
var certPath = './cert.pem';
var caPath = './ca.pem';
verifyCertificate(certPath, caPath);
