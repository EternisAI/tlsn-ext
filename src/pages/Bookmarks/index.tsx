import React, { ReactElement, useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import Icon from '../../components/Icon';
import { getNotaryApi, getProxyApi } from '../../utils/storage';
import { urlify, download, upload } from '../../utils/misc';
import { BackgroundActiontype } from '../../entries/Background/rpc';
import Modal, { ModalContent } from '../../components/Modal/Modal';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import { EXPLORER_API } from '../../utils/constants';
import { setNotaryRequestCid } from '../../entries/Background/db';
import { BookmarkManager } from '../../reducers/bookmarks';
import { RequestHistory } from '../../entries/Background/rpc';
import { notarizeRequest } from '../../reducers/requests';
import { useUniqueRequests } from '../../reducers/requests';

import { TLSN } from '../../entries/Content/content';

import { defaultBookmarks } from '../../utils/defaultBookmarks';
import { Bookmark } from '../../reducers/bookmarks';

const tlsn = new TLSN();
const bookmarkManager = new BookmarkManager();
export default function Bookmarks(): ReactElement {
  const requests = useUniqueRequests();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  console.log('requests', requests);
  const fetchBookmarks = useCallback(async () => {
    const bookmarks = await bookmarkManager.getBookmarks();
    console.log('fetchBookmarks', JSON.stringify(bookmarks[0]));
    setBookmarks(bookmarks);
  }, []);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  return (
    <div className="flex flex-col flex-nowrap overflow-y-auto">
      {defaultBookmarks.map((bookmark) => {
        return <DefaultBookmark key={bookmark.url} bookmark={bookmark} />;
      })}

      {bookmarks.length > 0 &&
        bookmarks.map((bookmark) => {
          return (
            <OneBookmark
              key={bookmark.url}
              bookmark={bookmark}
              fetchBookmarks={fetchBookmarks}
            />
          );
        })}
    </div>
  );
}

export function DefaultBookmark(props: { bookmark: Bookmark }): ReactElement {
  const { bookmark } = props;

  // if (!request) return <></>;
  return (
    <div
      className={classNames(
        'flex flex-row flex-nowrap border rounded-md p-2 gap-1 hover:bg-slate-50 cursor-pointer',
      )}
    >
      <div className="flex flex-col flex-nowrap flex-grow flex-shrink w-0">
        <div className="flex flex-row items-center text-xs">
          <div className="bg-slate-200 text-slate-400 px-1 py-0.5 rounded-sm">
            {bookmark?.method}
          </div>
          <div className="text-black font-bold px-2 py-1 rounded-md overflow-hidden text-ellipsis">
            {bookmark?.title}
          </div>
        </div>

        <div className="flex flex-row">
          <div className="font-bold text-slate-400">Url:</div>
          <div className="ml-2 text-slate-800">{bookmark?.url}</div>
        </div>
        <div className="flex flex-row">
          <div className="ml-2 text-slate-800">{bookmark?.description}</div>
        </div>
        <div className="flex flex-row">
          <div className="ml-2 text-slate-800">{bookmark?.type}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {<GenerateAttButton2 targetUrl={bookmark.targetUrl} />}
      </div>
      {bookmark.icon && (
        <div className="flex-shrink-0">
          <img src={bookmark.icon} className="w-6 h-6 rounded-full" />
        </div>
      )}
    </div>
  );
}

function GenerateAttButton2(p: {
  hidden?: boolean;
  targetUrl: string;
}): ReactElement {
  const { targetUrl } = p;
  const generateAttestation = useCallback(async () => {
    window.open(targetUrl, '_blank');
  }, [targetUrl]);

  if (p.hidden) return <></>;
  return (
    <button
      className="flex flex-row flex-grow-0 gap-2 self-end items-center justify-end px-2 py-1 bg-slate-100 text-slate-300 hover:bg-slate-200 hover:text-slate-500 hover:font-bold"
      onClick={generateAttestation}
    >
      <span className="text-xs font-bold">Generate Attestation</span>
    </button>
  );
}

export function OneBookmark(props: {
  bookmark: Bookmark;
  className?: string;
  hideActions?: string[];
  fetchBookmarks: () => Promise<void>;
}): ReactElement {
  const { hideActions = [] } = props;
  const dispatch = useDispatch();

  const [error, setError] = useState(false);
  const [showingError, showError] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showingShareConfirmation, setShowingShareConfirmation] =
    useState(false);
  const [cid, setCid] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();
  const [status, setStatus] = useState<'success' | 'error' | 'pending' | ''>(
    '',
  );
  const { bookmark } = props;
  const requestUrl = urlify(bookmark.url || '');

  const onDelete = useCallback(async () => {
    bookmarkManager.deleteBookmark(bookmark.url);
    props.fetchBookmarks();
  }, [bookmark]);

  const closeAllModal = useCallback(() => {
    setShowingShareConfirmation(false);
    showError(false);
  }, [setShowingShareConfirmation, showError]);

  // if (!request) return <></>;
  return (
    <div
      className={classNames(
        'flex flex-row flex-nowrap border rounded-md p-2 gap-1 hover:bg-slate-50 cursor-pointer',
        props.className,
      )}
    >
      {/* <ShareConfirmationModal />
      <ErrorModal /> */}
      <div className="flex flex-col flex-nowrap flex-grow flex-shrink w-0">
        <div className="flex flex-row items-center text-xs">
          <div className="bg-slate-200 text-slate-400 px-1 py-0.5 rounded-sm">
            {bookmark?.method}
          </div>
          <div className="text-black font-bold px-2 py-1 rounded-md overflow-hidden text-ellipsis">
            {requestUrl?.host}
          </div>
        </div>

        <div className="flex flex-row">
          <div className="font-bold text-slate-400">Url</div>
          <div className="ml-2 text-slate-800">{requestUrl?.pathname}</div>
        </div>
        <div className="flex flex-row">
          <div className="font-bold text-slate-400">TargetUrl</div>
          <div className="ml-2 text-slate-800">{bookmark.targetUrl}</div>
        </div>
        <div className="flex flex-row">
          <div className="font-bold text-slate-400">Type</div>
          <div className="ml-2 text-slate-800">{bookmark.type}</div>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {/* {status === 'error' && !!error && (
          <ErrorButton hidden={hideActions.includes('error')} />
        )} */}
        {<GenerateAttButton2 targetUrl={bookmark.targetUrl} />}
        {status === 'pending' && (
          <button className="flex flex-row flex-grow-0 gap-2 self-end items-center justify-end px-2 py-1 bg-slate-100 text-slate-300 font-bold">
            <Icon className="animate-spin" fa="fa-solid fa-spinner" size={1} />
            <span className="text-xs font-bold">Pending</span>
          </button>
        )}
        <ActionButton
          className="flex flex-row flex-grow-0 gap-2 self-end items-center justify-end px-2 py-1 bg-slate-100 text-slate-300 hover:bg-red-100 hover:text-red-500 hover:font-bold"
          onClick={onDelete}
          fa="fa-solid fa-trash"
          ctaText="Delete"
          hidden={hideActions.includes('delete')}
        />
      </div>
    </div>
  );

  // function ErrorButton(p: { hidden?: boolean }): ReactElement {
  //   if (p.hidden) return <></>;
  //   return (
  //     <button
  //       className="flex flex-row flex-grow-0 gap-2 self-end items-center justify-end px-2 py-1 bg-red-100 text-red-300 hover:bg-red-200 hover:text-red-500 hover:font-bold"
  //       onClick={onShowError}
  //     >
  //       <Icon fa="fa-solid fa-circle-exclamation" size={1} />
  //       <span className="text-xs font-bold">Error</span>
  //     </button>
  //   );
  // }

  // function ErrorModal(): ReactElement {
  //   const msg = typeof error === 'string' && error;
  //   return !showingError ? (
  //     <></>
  //   ) : (
  //     <Modal
  //       className="flex flex-col gap-4 items-center text-base cursor-default justify-center !w-auto mx-4 my-[50%] min-h-24 p-4 border border-red-500"
  //       onClose={closeAllModal}
  //     >
  //       <ModalContent className="flex justify-center items-center text-slate-500">
  //         {msg || 'Something went wrong :('}
  //       </ModalContent>
  //       <button
  //         className="m-0 w-24 bg-red-100 text-red-300 hover:bg-red-200 hover:text-red-500"
  //         onClick={closeAllModal}
  //       >
  //         OK
  //       </button>
  //     </Modal>
  //   );
  // }

  // function ShareConfirmationModal(): ReactElement {
  //   return !showingShareConfirmation ? (
  //     <></>
  //   ) : (
  //     <Modal
  //       className="flex flex-col items-center text-base cursor-default justify-center !w-auto mx-4 my-[50%] p-4 gap-4"
  //       onClose={closeAllModal}
  //     >
  //       <ModalContent className="flex flex-col w-full gap-4 items-center text-base justify-center">
  //         {!cid[props.requestId] ? (
  //           <p className="text-slate-500 text-center">
  //             {uploadError ||
  //               'This will make your proof publicly accessible by anyone with the CID'}
  //           </p>
  //         ) : (
  //           <input
  //             className="input w-full bg-slate-100 border border-slate-200"
  //             readOnly
  //             value={`${EXPLORER_API}/ipfs/${cid[props.requestId]}`}
  //             onFocus={(e) => e.target.select()}
  //           />
  //         )}
  //       </ModalContent>
  //       <div className="flex flex-row gap-2 justify-center">
  //         {!cid[props.requestId] ? (
  //           <>
  //             {!uploadError && (
  //               <button
  //                 onClick={handleUpload}
  //                 className="button button--primary flex flex-row items-center justify-center gap-2 m-0"
  //                 disabled={uploading}
  //               >
  //                 {uploading && (
  //                   <Icon
  //                     className="animate-spin"
  //                     fa="fa-solid fa-spinner"
  //                     size={1}
  //                   />
  //                 )}
  //                 I understand
  //               </button>
  //             )}
  //             <button
  //               className="m-0 w-24 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 font-bold"
  //               onClick={closeAllModal}
  //             >
  //               Close
  //             </button>
  //           </>
  //         ) : (
  //           <>
  //             <button
  //               onClick={() =>
  //                 copy(`${EXPLORER_API}/ipfs/${cid[props.requestId]}`)
  //               }
  //               className="m-0 w-24 bg-slate-600 text-slate-200 hover:bg-slate-500 hover:text-slate-100 font-bold"
  //             >
  //               Copy
  //             </button>
  //             <button
  //               className="m-0 w-24 bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600 font-bold"
  //               onClick={closeAllModal}
  //             >
  //               Close
  //             </button>
  //           </>
  //         )}
  //       </div>
  //     </Modal>
  //   );
  // }
}

function ActionButton(props: {
  onClick: () => void;
  fa: string;
  ctaText: string;
  className?: string;
  hidden?: boolean;
}): ReactElement {
  if (props.hidden) return <></>;

  return (
    <button
      className={classNames(
        'flex flex-row flex-grow-0 gap-2 self-end items-center justify-end px-2 py-1 hover:font-bold',
        props.className,
      )}
      onClick={props.onClick}
    >
      <Icon className="" fa={props.fa} size={1} />
      <span className="text-xs font-bold">{props.ctaText}</span>
    </button>
  );
}
