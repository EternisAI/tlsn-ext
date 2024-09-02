"use strict";
exports.__esModule = true;
var fs = require('fs');
var crypto = require("crypto");
var chain_certs_1 = require("./chain-certs");
var certPath = './cert.pem';
function verifyCertificate(certPath, chainCerts) {
    // Read the certificate and CA certificate
    //enclave certificate
    var cert = new crypto.X509Certificate(fs.readFileSync(certPath));
    //1st certificate is ec2 instance certificate
    // final certificate is the root certificate
    var result = true;
    for (var i = 0; i < chainCerts.length; i++) {
        var ca = new crypto.X509Certificate(chainCerts[i].Cert);
        var result_ = cert.verify(ca.publicKey);
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
if (verifyCertificate(certPath, chain_certs_1.chainCerts)) {
    console.log('====\n End Certificate is valid 🟢');
}
else {
    console.log('====\n End Certificate verification failed 🚫');
}
