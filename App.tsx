/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import Daily, {
  DailyEvent,
  DailyCall,
  DailyEventObject,
  DailyEventObjectAppMessage,
} from '@daily-co/react-native-daily-js';

import React, {useEffect, useState} from 'react';
import type {PropsWithChildren} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {useVapi} from './useVapi';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

enum AppState {
  Idle,
  Creating,
  Joining,
  Joined,
  Leaving,
  Error,
}

function App(): React.JSX.Element {
  const {toggleCall, joinCall} = useVapi();

  // const [appState, setAppState] = useState(AppState.Idle);
  // const [roomUrl, setRoomUrl] = useState<string | undefined>(undefined);
  // const [roomCreateError, setRoomCreateError] = useState<boolean>(false);
  // const [callObject, setCallObject] = useState<DailyCall | null>(null);
  // const [roomUrlFieldValue, setRoomUrlFieldValue] = useState<
  //   string | undefined
  // >(undefined);

  // useEffect(() => {
  //   if (!callObject || !roomUrl) {
  //     return;
  //   }
  //   callObject.join({url: roomUrl}).catch(_ => {
  //     // Doing nothing here since we handle fatal join errors in another way,
  //     // via our listener attached to the 'error' event
  //   });
  //   setAppState(AppState.Joining);
  // }, [callObject, roomUrl]);

  // /**
  //  * Create the callObject as soon as we have a roomUrl.
  //  * This will trigger the call starting.
  //  */
  // useEffect(() => {
  //   if (!roomUrl) {
  //     return;
  //   }
  //   const newCallObject = Daily.createCallObject({
  //     /*dailyConfig: {
  //       // Point to a specific version of the call-machine bundle
  //       // @ts-ignore
  //       callObjectBundleUrlOverride: 'https://b.staging.daily.co/call-ui/0a8807ac0fc0147c996b6db8d8b4c17f640dcd47/static/call-machine-object-bundle.js'
  //     }*/
  //   });
  //   setCallObject(newCallObject);
  // }, [roomUrl]);

  return (
    <SafeAreaView>
      <Button
        title="toggleCall"
        onPress={() => {
          toggleCall();
          console.log('toggling call');
        }}
      />
      <Button
        title="Join call"
        onPress={() => {
          joinCall().then(() => {
            console.log('joined the call call');
          });
        }}
      />
    </SafeAreaView>
  );
}

export default App;
