import React from 'react';
import { useNavigate } from 'react-router';
import NavButton from '../../components/NavButton';
import FavouriteStar from '../../components/SvgIcons/FavouriteStar';
import { useAllWebsites } from '../../reducers/history';

export default function Websites() {
  const navigate = useNavigate();
  const websites = useAllWebsites();

  return (
    <div className="flex flex-col gap-4 py-4 overflow-y-auto">
      <div className="flex flex-col flex-nowrap justify-center gap-2 mx-4">
        <NavButton
          ImageIcon={<FavouriteStar />}
          title="Favorites"
          subtitle=""
          onClick={() => navigate('/bookmarks')}
        />

        {websites.map(({ host, requests, faviconUrl }) => {
          return (
            <NavButton
              ImageIcon={
                <img src={faviconUrl} alt={host} className="h-6 w-6" />
              }
              key={host}
              title={host}
              subtitle={requests}
              onClick={() => navigate(`/website/${host}`)}
            />
          );
        })}
      </div>
    </div>
  );
}
