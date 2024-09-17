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
        const remoteAttbase64 = response.data.trim();
        console.log('response.data', remoteAttbase64);

        //analyze attestation validity here
        //const remoteAttestation = decodeCborAll(response.data);

        //verify pcrs values
        // const pcrs = remoteAttestation?.payload_object.pcrs;

        // if (!pcrs) {
        //   setIsValid(false);
        //   setLoading(false);
        //   return setError('pcrs not found');
        // }
        // if (
        //   pcrs?.get(1) !== EXPECTED_PCRS['1'] ||
        //   pcrs?.get(2) !== EXPECTED_PCRS['2']
        // ) {
        //   setIsValid(false);
        //   setLoading(false);
        //   return setError('pcrs values are not the one expected');
        // }

        chrome.runtime.sendMessage({
          type: OffscreenActionTypes.remote_attestation_verification,
          data: {
            remoteAttestation: remoteAttbase64,
            nonce,
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
