import React, {
  ChangeEvent,
  Children,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useCallback,
  useState,
} from 'react';

import { CheckCircle, XCircle } from 'lucide-react';

import { useRemoteAttestation } from '../../reducers/remote-attestation';
import Icon from '../Icon';
export default function RemoteAttestationBadge(): ReactElement {
  const { remoteAttestation, loading, error, isValid } = useRemoteAttestation();

  if (isValid === null) return <></>;
  return (
    <>
      <NotaryBadge isAuthenticated={isValid} />
    </>
  );
}

interface NotaryBadgeProps {
  isAuthenticated: boolean;
}

export function NotaryBadge({ isAuthenticated = false }: NotaryBadgeProps) {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full shadow-sm transition-all ${
        isAuthenticated
          ? 'bg-green-100 text-green-800 hover:bg-green-200'
          : 'bg-red-100 text-red-800 hover:bg-red-200'
      }`}
      title={
        (isAuthenticated
          ? 'Valid remote attestation ! '
          : 'Invalid remoteattestation') +
        `The remote attestation guarantees the
    authenticity of the code running the notary. Click to learn more`
      }
    >
      {isAuthenticated ? (
        <CheckCircle className="w-4 h-4 mr-2" />
      ) : (
        <XCircle className="w-4 h-4 mr-2" />
      )}

      <a
        className="text-sm font-medium inherit"
        href="https://aws.amazon.com/blogs/compute/validating-attestation-documents-produced-by-aws-nitro-enclaves/"
        target="_blank"
        style={{ color: 'black', textDecoration: 'none' }}
      >
        {isAuthenticated ? 'Notary Authenticated' : 'Not Authenticated'}
      </a>
    </div>
  );
}
