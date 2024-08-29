import { useState, useEffect } from 'react';
import axios from 'axios';
import { ENCLAVE_ENDPOINT } from '../utils/constants';
export const useRemoteAttestation = () => {
  const [remoteAttestation, setRemoteAttestation] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const enclaveEndpoint = `${ENCLAVE_ENDPOINT}/enclave/attestation?nonce=0000000000000000000000000000000000000000`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(enclaveEndpoint);
        setRemoteAttestation(response.data);
        //analyze attestation validity here
        setIsValid(true);
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
