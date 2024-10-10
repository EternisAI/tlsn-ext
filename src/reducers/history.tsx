import {
  BackgroundActiontype,
  RequestHistory,
} from '../entries/Background/rpc';
import { useSelector } from 'react-redux';
import { AppRootState } from './index';
import deepEqual from 'fast-deep-equal';
import { extractHostFromUrl, extractPathFromUrl } from '../utils/misc';

enum ActionType {
  '/history/addRequest' = '/history/addRequest',
  '/history/deleteRequest' = '/history/deleteRequest',
}

type Action<payload> = {
  type: ActionType;
  payload?: payload;
  error?: boolean;
  meta?: any;
};

type State = {
  map: {
    [requestId: string]: RequestHistory;
  };
  order: string[];
};

const initialState: State = {
  map: {},
  order: [],
};

export const addRequestHistory = (request?: RequestHistory | null) => {
  return {
    type: ActionType['/history/addRequest'],
    payload: request,
  };
};

export const deleteRequestHistory = (id: string) => {
  chrome.runtime.sendMessage<any, string>({
    type: BackgroundActiontype.delete_prove_request,
    data: id,
  });

  return {
    type: ActionType['/history/deleteRequest'],
    payload: id,
  };
};

export default function history(
  state = initialState,
  action: Action<any>,
): State {
  switch (action.type) {
    case ActionType['/history/addRequest']: {
      const payload: RequestHistory = action.payload;

      if (!payload) return state;

      const existing = state.map[payload.id];
      const newMap = {
        ...state.map,
        [payload.id]: payload,
      };
      const newOrder = existing ? state.order : state.order.concat(payload.id);

      return {
        ...state,
        map: newMap,
        order: newOrder,
      };
    }
    case ActionType['/history/deleteRequest']: {
      const reqId: string = action.payload;
      const newMap = { ...state.map };
      delete newMap[reqId];
      const newOrder = state.order.filter((id) => id !== reqId);
      return {
        ...state,
        map: newMap,
        order: newOrder,
      };
    }
    default:
      return state;
  }
}

export const useHistoryOrder = (
  host?: string,
  url?: string,
  urlRegex?: string,
): string[] => {
  return useSelector((state: AppRootState) => {
    const allRequests = [...state.history.order].reverse();
    return allRequests.filter((id) => {
      if (!host && !url && !urlRegex) return true;
      else if (host) {
        const req = state.history.map[id];
        return req.url.includes(host);
      } else if (url) {
        const req = state.history.map[id];
        return req.url.includes(url);
      } else if (urlRegex) {
        console.log('urlRegex', urlRegex);
        const req = state.history.map[id];
        const regex = new RegExp(urlRegex);
        console.log('regex', regex);
        return regex.test(req.url);
      }
    });
  }, deepEqual);
};

export const useAllProofHistory = (): RequestHistory[] => {
  return useSelector((state: AppRootState) => {
    return state.history.order.map((id) => state.history.map[id]);
  }, deepEqual);
};

export const useRequestHistory = (id?: string): RequestHistory | undefined => {
  return useSelector((state: AppRootState) => {
    if (!id) return undefined;
    return state.history.map[id];
  }, deepEqual);
};

export const useAllRequestHistory = (): RequestHistory[] => {
  return useSelector((state: AppRootState) => {
    return state.history.order.map((id) => state.history.map[id]);
  }, deepEqual);
};

export const useAllRequestHistoryByUrl = (url: string): RequestHistory[] => {
  return useSelector((state: AppRootState) => {
    return state.history.order
      .map((id) => state.history.map[id])
      .filter((req) => req.url === url);
  }, deepEqual);
};

export const useAllWebsites = (): {
  host: string;
  requests: string;
  faviconUrl: string;
}[] => {
  return useSelector((state: AppRootState) => {
    const allRequests = state.history.order.map((id) => state.history.map[id]);
    const websites = {} as { [host: string]: Set<string> };
    const faviconUrls = {} as { [host: string]: string };

    allRequests.forEach((req) => {
      const host = extractHostFromUrl(req.url);
      const path = extractPathFromUrl(req.url);
      if (!websites[host]) {
        websites[host] = new Set();
      }
      websites[host].add(path);

      if (!faviconUrls[host]) {
        // faviconUrls[host] = req.faviconUrl;
        faviconUrls[host] = 'https://www.google.com/favicon.ico';
      }
    });

    return Object.keys(websites).map((host) => ({
      host,
      requests: Array.from(websites[host]).join(', '),
      faviconUrl: faviconUrls[host],
    }));
  }, deepEqual);
};
