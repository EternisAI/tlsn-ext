import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { NOTARY_API } from '../utils/constants';
import { decodeCborAll, RemoteAttestation, generateNonce } from 'tlsn-js';
import * as Comlink from 'comlink';
import { OffscreenActionTypes } from '../entries/Offscreen/types';
import { EXPECTED_PCRS } from '../utils/constants';
export const useRemoteAttestation = () => {
  const [remoteAttestation, setRemoteAttestation] =
    useState<RemoteAttestation | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    (async () => {
      chrome.runtime.onMessage.addListener(
        async (request, sender, sendResponse) => {
          switch (request.type) {
            case OffscreenActionTypes.remote_attestation_verification_response: {
              const result = request.data;
              setIsValid(result);
            }
          }
        },
      );
    })();
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const nonce = generateNonce();
        const enclaveEndpoint = `${NOTARY_API}/enclave/attestation?nonce=${nonce}`;

        const response = await axios.get(enclaveEndpoint);
        setRemoteAttestation(response.data);
        //analyze attestation validity here
        const remoteAttestation = decodeCborAll(response.data);

        //verify pcrs values
        const pcrs = remoteAttestation?.payload_object.pcrs;

        if (!pcrs) {
          setIsValid(false);
          setLoading(false);
          return setError('pcrs not found');
        }
        if (
          pcrs?.get(1) !== EXPECTED_PCRS['1'] ||
          pcrs?.get(2) !== EXPECTED_PCRS['2']
        ) {
          setIsValid(false);
          setLoading(false);
          return setError('pcrs values are not the one expected');
        }
        //verify nonce
        const nonce_ = remoteAttestation?.payload_object.nonce;
        console.log('nonce_', nonce_, typeof nonce_);

        console.log('nonce', nonce, typeof nonce);
        if (nonce_ !== nonce) {
          setIsValid(false);
          setLoading(false);
          return setError('nonce is not the one expected');
        }
        //verify x509 certificate
        // const resultx509 = verifyx509Certificate(certificateUint8Array);
        // console.log('resultx509', resultx509);
        // if (!resultx509) {
        //   console.log('x509 certificate is not valid');
        //   setError('x509 certificate is not valid');
        // }

        //verify authenticity of document
        chrome.runtime.sendMessage({
          type: OffscreenActionTypes.remote_attestation_verification,
          data: {
            remoteAttestation,
          },
        });
      } catch (error) {
        setError(error as any);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { remoteAttestation, loading, error, isValid };
};
