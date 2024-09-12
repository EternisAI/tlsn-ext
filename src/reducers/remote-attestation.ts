import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENCLAVE_ENDPOINT } from '../utils/constants';
import {
  decodeCborAll,
  RemoteAttestation,
  verifyx509Certificate,
} from 'tlsn-js';
import * as Comlink from 'comlink';
import { OffscreenActionTypes } from '../entries/Offscreen/types';
export const useRemoteAttestation = () => {
  const [remoteAttestation, setRemoteAttestation] =
    useState<RemoteAttestation | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const enclaveEndpoint = `${ENCLAVE_ENDPOINT}/enclave/attestation?nonce=0000000000000000000000000000000000000000`;

  useEffect(() => {
    (async () => {
      chrome.runtime.onMessage.addListener(
        async (request, sender, sendResponse) => {
          console.log('OffscreenActionTypes', request);
          switch (request.type) {
            case OffscreenActionTypes.remote_attestation_verification_response: {
              console.log(
                'OffscreenActionTypes.remote_attestation_verification_response',
              );
              const result = request.data;
              console.log(
                'OffscreenActionTypes.remote_attestation_verification_response',
                result,
              );
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
        const response = await axios.get(enclaveEndpoint);
        setRemoteAttestation(response.data);
        //analyze attestation validity here
        const remoteAttestation = decodeCborAll(response.data);
        console.log(remoteAttestation?.certificate);

        // const certificateUint8Array = Buffer.from(
        //   remoteAttestation?.certificate as string,
        //   'base64',
        // );

        // const resultx509 = verifyx509Certificate(certificateUint8Array);
        // console.log('resultx509', resultx509);
        // if (!resultx509) {
        //   console.log('x509 certificate is not valid');
        //   setError('x509 certificate is not valid');
        // }

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
