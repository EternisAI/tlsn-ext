import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { download, printAttestation, urlify } from '../../utils/misc';
import { useRequestHistory } from '../../reducers/history';

import { decodeTLSData } from '../../utils/misc';
import { AttrAttestation } from '../../utils/types';
import { CheckCircle } from 'lucide-react';

export default function AttestationDetails() {
  const params = useParams<{ host: string; requestId: string }>();

  const request = useRequestHistory(params.requestId);
  const requestUrl = urlify(request?.url || '');

  const [attributeAttestation, setAttributeAttestation] =
    useState<AttrAttestation>();
  const [attributes, setAttributes] = useState<string[]>([]);
  const [sessionData, setSessionData] = useState<string>('');

  useEffect(() => {
    const AttributeAttestation = request?.proof as AttrAttestation;
    console.log('AttributeAttestation', AttributeAttestation);
    if (!AttributeAttestation) return;
    setAttributeAttestation(AttributeAttestation);
    if (AttributeAttestation.attestations) {
      const attestations = AttributeAttestation.attestations.split(';');
      const attributes = [];
      for (const attestation of attestations) {
        const [key] = attestation.split(':');
        if (key) attributes.push(key);
      }
      console.log('attributes', attributes);
      setAttributes(attributes);
    } else {
      const signedSessionDecoded = decodeTLSData(
        AttributeAttestation.applicationData,
      );
      setSessionData(signedSessionDecoded.response);
    }
  }, [request]);

  if (!attributeAttestation) return <>ahi</>;
  return (
    <div className="flex flex-col gap-4 py-4 overflow-y-auto flex-1">
      <div className="flex flex-col flex-nowrap justify-center gap-2 mx-4">
        <div className="p-4 border border-[#E4E6EA] bg-white rounded-xl flex flex-col">
          <div className="flex flex-row items-center">
            <div className="flex-1 font-bold text-[#4B5563] text-lg truncate">
              Attestation for {requestUrl?.host}
            </div>
          </div>

          <div>
            <AttributeAttestation
              attrAttestation={attributeAttestation}
              attributes={attributes}
              sessionData={sessionData}
            />
          </div>

          <div className="flex mt-4">
            <div
              onClick={() => {
                const text = JSON.stringify(request?.proof);
                navigator.clipboard.writeText(text);
                alert('Copied to clipboard');
              }}
              className="flex-1 text-center cursor-pointer border border-[#E9EBF3] bg-[#F6F7FC] hover:bg-[#dfe0e5] text-[#092EEA] text-sm font-medium py-[10px] px-4 rounded-lg"
            >
              Copy
            </div>

            <div
              onClick={() => {
                if (!request) return;
                download(request.id, JSON.stringify(request.proof));
              }}
              className="flex-1 ml-2 text-center cursor-pointer border border-[#E9EBF3] bg-[#F6F7FC] hover:bg-[#dfe0e5] text-[#092EEA] text-sm font-medium py-[10px] px-4 rounded-lg"
            >
              Download
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AttributeAttestation(props: {
  attrAttestation: AttrAttestation;
  attributes: string[];
  sessionData: string;
}) {
  const { attrAttestation, attributes, sessionData } = props;
  return (
    <div className="text-[#9BA2AE] text-[14px] w-full max-w-3xl mx-auto  overflow-hidden relative">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold">Notary url</h3>
            <p className="break-all">{attrAttestation.meta.notaryUrl}</p>
          </div>
          <div>
            <h3 className="font-semibold">Version</h3>
            <p>{attrAttestation.version}</p>
          </div>
          <div>
            <h3 className="font-semibold">Websocket proxy url</h3>
            <p className="break-all">
              websocket proxy: {attrAttestation.meta.websocketProxyUrl}
            </p>
          </div>

          <div className="col-span-2">
            <h3 className="font-semibold">Signature</h3>
            <p className="break-all text-xs">{attrAttestation.signature}</p>
          </div>
        </div>
        <div className="border-t pt-4">
          <h3 className="font-semibold mb-2">Attributes</h3>

          {props.attributes.map((attribute) => (
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-700 text-green-100 text-sm font-medium">
              <CheckCircle className="w-4 h-4 mr-2" />
              {attribute}
            </div>
          ))}

          {!attributes.length && <p>{sessionData}</p>}
        </div>
      </div>
    </div>
  );
}
