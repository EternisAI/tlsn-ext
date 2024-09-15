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
      <div className="flex items-center">
        {isValid ? (
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
        ) : (
          <div className="w-3 h-3 bg-red-400 rounded-full"></div>
        )}
        <div className="w-1"></div>

        <span className="text-xs mr-2"> Notary Authenticated</span>
      </div>
    </>
  );
}
