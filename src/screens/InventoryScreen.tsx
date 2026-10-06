import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import PokeBall from '../components/PokeBall';
import { POKEMON_COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { UserInventoryItem } from '../types';

export default function InventoryScreen({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<UserInventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      const defaultItems: UserInventoryItem[] = [
        { id: 'inv-1', user_id: user?.id || 'demo', item_type: 'poke_ball', quantity: 25 },
        { id: 'inv-2', user_id: user?.id || 'demo', item_type: 'great_ball', quantity: 10 },
        { id: 'inv-3', user_id: user?.id || 'demo', item_type: 'ultra_ball', quantity: 5 },
        { id: 'inv-4', user_id: user?.id || 'demo', item_type: 'potion', quantity: 15 },
        { id: 'inv-5', user_id: user?.id || 'demo', item_type: 'super_potion', quantity: 5 },
      ];

      try {
        if (user) {
          const { data } = await supabase
            .from('user_inventory')
            .select('*')
            .eq('user_id', user.id);

          if (data && data.length > 0) {
            setItems(data as UserInventoryItem[]);
          } else {
            setItems(defaultItems);
          }
        } else {
          setItems(defaultItems);
        }
      } catch (e) {
        setItems(defaultItems);
      }
      setLoading(false);
    }

    loadInventory();
  }, [user]);

  const renderItemVisual = (type: string) => {
    switch (type) {
      case 'poke_ball':
        return <PokeBall size={48} type="poke" />;
      case 'great_ball':
        return <PokeBall size={48} type="great" />;
      case 'ultra_ball':
        return <PokeBall size={48} type="ultra" />;
      case 'potion':
        return <Text style={{ fontSize: 38 }}>🧪</Text>;
      case 'super_potion':
        return <Text style={{ fontSize: 38 }}>💉</Text>;
      default:
        return <Text style={{ fontSize: 38 }}>📦</Text>;
    }
  };

  const getItemName = (type: string) => {
    switch (type) {
      case 'poke_ball':
        return 'Pokéball Básica';
      case 'great_ball':
        return 'Superball (1.5x)';
      case 'ultra_ball':
        return 'Ultraball (2.0x)';
      case 'potion':
        return 'Poción HP (Restaura 20 HP)';
      case 'super_potion':
        return 'Superpoción (Restaura 50 HP)';
      default:
        return type;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🎒 Mochila de Aventurero</Text>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>✕ CERRAR</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFCB05" style={{ marginTop: 40 }} />
      ) : items.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>Tu mochila está vacía.</Text>
          <Text style={styles.emptySub}>Gira Poképaradas en el campus para obtener ítems.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <View style={styles.iconContainer}>{renderItemVisual(item.item_type)}</View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{getItemName(item.item_type)}</Text>
                <Text style={styles.itemTypeTag}>{item.item_type.toUpperCase()}</Text>
              </View>

              <View style={styles.badgeQty}>
                <Text style={styles.qtyText}>x{item.quantity}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { color: '#F8FAFC', fontSize: 22, fontWeight: '900' },
  closeBtn: { backgroundColor: '#334155', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  closeText: { color: '#F8FAFC', fontWeight: '800', fontSize: 12 },
  list: { paddingBottom: 40 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#334155',
    elevation: 4,
  },
  iconContainer: { marginRight: 16 },
  itemInfo: { flex: 1 },
  itemName: { color: '#F8FAFC', fontSize: 15, fontWeight: '900' },
  itemTypeTag: { color: '#FFCB05', fontSize: 11, fontWeight: '800', marginTop: 2 },
  badgeQty: { backgroundColor: '#2A75BB', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  qtyText: { color: '#FFF', fontWeight: '900', fontSize: 15 },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 12 },
  emptyText: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  emptySub: { color: '#94A3B8', fontSize: 14, marginTop: 4, textAlign: 'center' },
});
