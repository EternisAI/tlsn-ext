import React, {
  ChangeEvent,
  Children,
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useCallback,
  useState,
  useEffect,
} from 'react';

import Icon from '../Icon';
import { set } from '../../utils/storage';
export default function ToggleExtensionButton(): ReactElement {
  return (
    <div
      className="absolute right-2 flex flex-nowrap flex-row items-center gap-1 justify-center w-fit cursor-pointer"
      onClick={() => {
        console.log('toggle');
      }}
    >
      <SimpleToggle />
    </div>
  );
}

export function SimpleToggle() {
  const [isOn, setIsOn] = useState<boolean | null>(null);

  const toggle = () => {
    setIsOn(!isOn);
    chrome.storage.sync.set({ 'enable-extension': !isOn });
  };

  useEffect(() => {
    async function getIsOn() {
      const enabledExtension =
        await chrome.storage.sync.get('enable-extension');
      console.log('enabledExtension', enabledExtension);
      setIsOn(enabledExtension['enable-extension']);
    }
    getIsOn();
  }, []);

  if (isOn === null) {
    return <></>;
  }

  return (
    <button
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
        isOn ? 'bg-blue-600' : 'bg-gray-200'
      }`}
      onClick={toggle}
      role="switch"
      aria-checked={isOn}
    >
      <span className="sr-only">Toggle switch</span>
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isOn ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}
