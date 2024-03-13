// create a vapi media component that take vapi class instance as prop
// and render the media stream of the vapi class instance

import React from 'react';
import {Text} from 'react-native';

import {DailyMediaView} from '@daily-co/react-native-daily-js';

export default function VapiMedia({audioState}: {audioState: any}) {
  console.log('audioState', audioState);
  return (
    <>
      {audioState?.state === 'playable' && audioState?.track && (
        <>
          <Text>Audio</Text>
          <DailyMediaView
            videoTrack={null}
            audioTrack={audioState?.track as any}
            objectFit="cover"
          />
        </>
      )}
    </>
  );
}
