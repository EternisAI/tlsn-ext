import React, { useCallback, useEffect, useState } from 'react';
import { FavoritesManager } from '../../reducers/favorites';
import Back from '../../components/SvgIcons/Back';
import Star from '../../components/SvgIcons/Star';

const favoritesManager = new FavoritesManager();

const getTitleFromPath = (path: string) => {
  const steps = path.split('/');
  const step = steps[steps.length - 1];

  switch (step) {
    case 'requests':
      return 'Requests';
    case 'history':
      return 'Attestations';
    case 'bookmarks':
      return 'Bookmarks';
    case 'favorites':
      return 'Favorites';
    case 'websites':
      return 'Websites';
    case 'options':
      return 'Settings';
    case 'home':
      return 'Home';
    default:
      return 'Eternis';
  }
};

const handleBackClick = (path: string, navigate: any) => {
  const steps = path.split('/');

  // special case to handle webiste history path
  if (steps.length > 2 && steps.at(-2) === 'history') {
    if (steps.at(-3) === 'favorites') {
      navigate('/websites/favorites');
      return;
    }
    if (steps.at(-3) === 'websites') {
      navigate('/websites');
      return;
    }

    if (steps.length === 3) {
      navigate('/websites');
      return;
    }
  }

  // special case to handle attestations history path
  if (steps.length > 2 && steps.at(-2) === 'attestation') {
    if (steps.at(-5) === 'favorites') {
      navigate('/websites/favorites/history/' + steps.at(-3));
      return;
    }

    if (steps.at(-5) === 'websites') {
      navigate('/websites/history/' + steps.at(-3));
      return;
    }

    if (steps.at(-4) === 'history') {
      navigate('/history');
      return;
    }
  }

  // special case to handle favorites path
  if (steps.length > 2 && steps.at(-2) === 'favorites') {
    navigate('/websites');
    return;
  }

  steps.pop();
  navigate(steps.join('/'));
};

export default function PopupHeader({
  pathname,
  navigate,
}: {
  pathname: string;
  navigate: any;
}) {
  const [isFavorite, setIsFavorite] = useState(false);

  const getFavorite = useCallback(async (host: string) => {
    const favorite = await favoritesManager.isFavorite(host);
    setIsFavorite(favorite);
  }, []);

  useEffect(() => {
    const steps = pathname.split('/');
    let host = steps.at(-1) || '';
    if (steps.at(-2) === 'attestation') {
      host = steps.at(-3) || '';
    }
    if (steps.length > 2 && steps.at(-2) === 'history') {
      getFavorite(host);
    }
  }, [pathname, getFavorite]);

  const renderHeader = () => {
    const steps = pathname.split('/');
    let host = steps.at(-1) || '';
    if (steps.at(-2) === 'attestation') {
      host = steps.at(-3) || '';
    }
    if (
      steps.length > 2 &&
      (steps.at(-2) === 'history' || steps.at(-2) === 'attestation')
    ) {
      return (
        <div className="cursor-pointer leading-6 text-[1rem] flex items-center">
          <div
            className="h-4 w-4 mr-1"
            onClick={() => {
              favoritesManager.toggleFavorite(host);
              setIsFavorite((f) => !f);
            }}
          >
            <Star isStarred={isFavorite} />
          </div>
          {host}
        </div>
      );
    }

    return (
      <div className="cursor-pointer leading-6 text-[1rem]">
        {getTitleFromPath(pathname)}
      </div>
    );
  };

  return (
    <div className="flex flex-nowrap flex-shrink-0 flex-row items-center relative gap-2 py-4 cursor-default justify-center bg-white w-full border-[#E4E6EA] border-b">
      {renderHeader()}
      {pathname !== '/home' && (
        <div
          className="absolute left-[18px] h-8 w-8 cursor-pointer hover:bg-gray-100 rounded-md border border-[#E4E6EA] flex items-center justify-center"
          onClick={() => handleBackClick(pathname, navigate)}
        >
          <Back />
        </div>
      )}
    </div>
  );
}
