import { useState, useEffect } from 'react';
import axios from 'axios';

export const useRemoteAttestation = () => {
  const [remoteAttestation, setRemoteAttestation] = useState(null);
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://tlsn.eternis.ai/enclave');
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
