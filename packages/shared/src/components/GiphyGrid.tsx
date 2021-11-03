import { GiphyFetch } from '@giphy/js-fetch-api';
import { Grid } from '@giphy/react-components';
import { observer } from 'mobx-react-lite';
import React, { FunctionComponent, useMemo, useRef } from 'react';
import styled from 'styled-components';

import { GiphyLogo } from '@fc/shared/assets/GiphyLogo';

import { GiphyCloseIcon } from '../assets/icons/GiphyCloseIcon';
import { useSocket } from '../utils/SocketProvider';
import { useOnClickOutside } from '../utils/hooks/use-on-outside-click';

const gf = new GiphyFetch('omj1iPoq5H5GTi2Xjz2E9NFCcVqGLuPZ');

interface GiphyGridProps {
  store: any;
  setTextMessage: (text: string) => void;
  textMessage: string;
}

export const GiphyGrid: FunctionComponent<GiphyGridProps> = observer(
  (props) => {
    const socket = useSocket();
    const ref = useRef(null);
    useOnClickOutside(ref, () => props.setTextMessage(''));

    const searchTerm = useMemo(() => {
      if (props.textMessage.startsWith('/giphy')) {
        return props.textMessage.replace('/giphy', '');
      }
      return '';
    }, [props.textMessage]);

    const isGiphy = useMemo(
      () => props.textMessage.startsWith('/giphy'),
      [props.textMessage]
    );

    return isGiphy ? (
      <Giphy ref={ref}>
        <GiphyHeader>
          <div className="logo">
            <GiphyLogo />
          </div>
          <div className="searchterm">{searchTerm}</div>
          <div className="close" onClick={() => props.setTextMessage('')}>
            <GiphyCloseIcon />
          </div>
        </GiphyHeader>
        <GridWrapper>
          <Grid
            noResultsMessage={<Empty>Nothing found 🙈</Empty>}
            width={290}
            columns={2}
            gutter={9}
            noLink={true}
            fetchGifs={(offset) =>
              searchTerm
                ? gf.search(searchTerm, { offset, limit: 10 })
                : gf.trending({ offset, limit: 10 })
            }
            key={searchTerm}
            overlay={({ gif }) => (
              <div
                className="overlay"
                onClick={() => {
                  const data = {
                    giphy: gif.id,
                    date: new Date(),
                    external: !props.store.addMessage,
                  };
                  const message = props.store.encryptor.encrypt(
                    JSON.stringify(data)
                  );

                  if (socket) {
                    socket.emit('chat message', {
                      roomName: props.store.roomName || props.store.room,
                      message,
                    });

                    if (props.store.addMessage) {
                      props.store.addMessage(message);
                    } else {
                      props.store.addLocalMessage(message);
                    }
                  }

                  props.setTextMessage('');
                }}
              />
            )}
          />
        </GridWrapper>
      </Giphy>
    ) : null;
  }
);

const GridWrapper = styled.div`
  overflow: auto;
`;

const Empty = styled.div`
  overflow: auto;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 15px;
`;

const GiphyHeader = styled.div`
  display: flex;
  padding: 0 0 12px;
  align-items: center;
  .logo {
    margin-left: 5px;
    svg {
      width: 70px;
      height: 15px;
    }
  }
  .searchterm {
    color: #4c4c4c;
    margin-left: 6px;
  }
  .close {
    margin-left: auto;
    cursor: pointer;
  }
`;

const Giphy = styled.div`
  position: absolute;
  z-index: 15;
  bottom: 54px;
  transform: translateX(-50%);
  left: 50%;
  color: #fff;
  display: grid;
  grid-template-rows: 36px 1fr;
  width: 315px;
  height: 250px;
  background-color: #000;
  border-radius: 14px;
  padding: 9px;
  .overlay {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      background-color: rgba(0, 0, 0, 0.4);
    }
  }
`;
