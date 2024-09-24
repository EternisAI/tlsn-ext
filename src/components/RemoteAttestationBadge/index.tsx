import React, { ReactElement } from 'react';

import { Lock } from 'lucide-react';
import { useRemoteAttestation } from '../../reducers/remote-attestation';

import { useExtensionEnabled } from '../../reducers/requests';

export default function RemoteAttestationBadge(): ReactElement {
  const { remoteAttestation, loading, error, isValid } = useRemoteAttestation();
  const isExtensionEnabled = useExtensionEnabled();

  if (isValid === null) return <></>;
  return (
    <>
      <div className="  items-center">
        <>
          {isValid ? (
            <div>
              <div
                className="inline-flex items-center px-3 py-2 rounded-md bg-green-100"
                role="status"
                aria-live="polite"
              >
                <Lock
                  className="w-4 h-4 mr-2 text-green-600"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-green-600">
                  Connection is secure
                </span>
              </div>
            </div>
          ) : (
            <>
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-1"></div>
              <span className="text-xs mr-2"> Notary Not Authenticated</span>

              <div className="text-xs mr-2">{error}</div>
            </>
          )}
        </>
      </div>
    </>
  );
}
