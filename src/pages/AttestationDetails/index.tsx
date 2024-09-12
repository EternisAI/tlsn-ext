import React from 'react';
import { useParams } from 'react-router';
import { download, printAttestation, urlify } from '../../utils/misc';
import { useRequestHistory } from '../../reducers/history';

export default function AttestationDetails() {
  const params = useParams<{ host: string; requestId: string }>();

  const request = useRequestHistory(params.requestId);
  const requestUrl = urlify(request?.url || '');

  return (
    <div className="flex flex-col gap-4 py-4 overflow-y-auto flex-1">
      <div className="flex flex-col flex-nowrap justify-center gap-2 mx-4">
        <div className="p-4 border border-[#E4E6EA] bg-white rounded-xl flex flex-col">
          <div className="flex flex-row items-center">
            <div className="flex-1 font-bold text-[#4B5563] text-lg truncate">
              {requestUrl?.host}
            </div>
          </div>

          <div className="w-full text-[#9BA2AE] text-[14px] break-all h-full mt-4 flex flex-col">
            {request?.proof
              ? (printAttestation(request?.proof, true) as string[]).map(
                  (s) => <div>{s}</div>,
                )
              : ''}
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
