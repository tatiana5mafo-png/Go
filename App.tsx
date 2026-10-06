import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import BottomTabs, { TabKey } from './src/components/BottomTabs';
import { AuthProvider } from './src/context/AuthContext';
import { InventoryProvider } from './src/context/InventoryContext';
import BackpackScreen from './src/screens/BackpackScreen';
import GameMapScreen from './src/screens/GameMapScreen';
import PokedexScreen from './src/screens/PokedexScreen';


export default function App() {
  const [tab, setTab] = useState<TabKey>('map');

  return (
    <AuthProvider>
      <InventoryProvider>
        <View style={styles.root}>
          <View style={styles.content}>
            {tab === 'map' && <GameMapScreen />}
            {tab === 'dex' && <PokedexScreen />}
            {tab === 'bag' && <BackpackScreen />}
          </View>
          <BottomTabs tab={tab} onChange={setTab} />
        </View>
      </InventoryProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f1f5fd' },
  content: { flex: 1 },
});