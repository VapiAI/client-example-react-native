import React from 'react';
import { Button, SafeAreaView } from 'react-native';

import { useVapi } from './useVapi';

function App(): React.JSX.Element {
  const { toggleCall } = useVapi();

  return (
    <SafeAreaView>
      <Button
        title="toggleCall"
        onPress={() => {
          toggleCall();
          console.log('toggling call');
        }}
      />
    </SafeAreaView>
  );
}

export default App;
