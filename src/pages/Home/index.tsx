import React, {
  MouseEventHandler,
  ReactElement,
  ReactNode,
  useState,
} from 'react';
import Icon from '../../components/Icon';
import classNames from 'classnames';
import { useNavigate } from 'react-router';
import { useRequests } from '../../reducers/requests';
import { PluginList } from '../../components/PluginList';
import PluginUploadInfo from '../../components/PluginInfo';
import { ErrorModal } from '../../components/ErrorModal';
import Globe from '../../components/SvgIcons/Globe';
import ChevronRight from '../../components/SvgIcons/ChevronRight';
import Clipboard from '../../components/SvgIcons/Clipboard';
import Search from '../../components/SvgIcons/Search';
import Settings from '../../components/SvgIcons/Settings';

export default function Home(): ReactElement {
  const requests = useRequests();
  const navigate = useNavigate();
  const [error, showError] = useState('');

  return (
    <div className="flex flex-col gap-4 py-4 overflow-y-auto">
      {error && <ErrorModal onClose={() => showError('')} message={error} />}
      <div className="flex flex-col flex-nowrap justify-center gap-2 mx-4">
        <NavButton
          ImageIcon={<Globe />}
          title="Websites"
          subtitle="List of websites to get attestations from"
          onClick={() => navigate('/bookmarks')}
        />

        <NavButton
          ImageIcon={<Clipboard />}
          title="Attestations"
          subtitle="See your attestations in progress"
          onClick={() => navigate('/history')}
        />

        <NavButton
          ImageIcon={<Search />}
          title="Search requests"
          subtitle={`Search previous ${requests.length} search requests`}
          onClick={() => navigate('/requests')}
        />

        <NavButton
          ImageIcon={<Settings />}
          title="Settings"
          subtitle="Extension settings"
          onClick={() => navigate('/options')}
        />

        {/* <NavButton fa="fa-solid fa-hammer" onClick={() => navigate('/custom')}>
          Custom
        </NavButton> */}
        {/* <NavButton
          fa="fa-solid fa-certificate"
          onClick={() => navigate('/verify')}
        >
          Verify
        </NavButton> */}

        {/* <NavButton className="relative" fa="fa-solid fa-plus">
          <PluginUploadInfo />
          Add a plugin
        </NavButton> */}
        {/* <NavButton fa="fa-solid fa-gear" >
          Options
        </NavButton> */}
      </div>
      {/* <PluginList className="mx-4" /> */}
    </div>
  );
}

function NavButton(props: {
  ImageIcon: ReactNode;
  title: string;
  subtitle: string;

  onClick?: MouseEventHandler;
  className?: string;
  disabled?: boolean;
}): ReactElement {
  const { ImageIcon, title, subtitle, onClick, className, disabled } = props;
  return (
    <button
      className={classNames(
        'flex flex-row flex-nowrap items-center',
        'rounded-xl px-4 py-4 border border-[#E4E6EA]',
        'bg-white hover:bg-gray-100 cursor-pointer',
        className,
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {ImageIcon}

      <div className="flex flex-col flex-nowrap items-start ml-4 flex-1">
        <span className="text-sm text-textGray">{title}</span>
        <span className="text-xs text-textGrayLight">{subtitle}</span>
      </div>

      <div className="flex items-center h-5 w-5">
        <ChevronRight />
      </div>
    </button>
  );
}
