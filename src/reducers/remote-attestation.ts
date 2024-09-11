import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENCLAVE_ENDPOINT } from '../utils/constants';
import { decodeCborAll, RemoteAttestation } from 'tlsn-js';
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
          switch (request.type) {
            case OffscreenActionTypes.remote_attestation_verification_response: {
              const result = request.data;
              console.log(
                'OffscreenActionTypes.remote_attestation_verification_response',
                result,
              );
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
        const decoded = decodeCborAll(response.data);
        console.log(decoded);

        setIsValid(true);

        chrome.runtime.sendMessage({
          type: OffscreenActionTypes.remote_attestation_verification,
          data: {
            decoded,
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
