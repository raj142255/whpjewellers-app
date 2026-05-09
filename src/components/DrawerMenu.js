// src/components/DrawerMenu.js
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Modal, ScrollView, Image, ActivityIndicator,
} from 'react-native';
import { fetchMenu } from '../api';

const LOGO_URL = 'https://cdn.shopify.com/s/files/1/0714/0419/1917/files/WHP_LOGO_9_10_25_2_brand_color_1.png?v=1765269037';

const FALLBACK = [
  { id: '1', title: 'All Jewellery', url: '' },
  { id: '2', title: 'Rings', url: '/collections/rings' },
  { id: '3', title: 'Earrings', url: '/collections/earrings' },
  { id: '4', title: 'Bracelets & Bangles', url: '/collections/bracelets-bangles' },
  { id: '5', title: 'Solitaires', url: '/collections/solitaires' },
  { id: '6', title: 'Mangalsutras', url: '/collections/mangalsutras' },
  { id: '7', title: 'Necklaces & Pendants', url: '/collections/necklaces-pendants' },
];

export default function DrawerMenu({ visible, onClose, onSelectCategory }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible && menuItems.length === 0) {
      fetchMenu()
        .then(items => setMenuItems(items.length ? items : FALLBACK))
        .catch(() => setMenuItems(FALLBACK))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  function handlePress(item) {
    const handle = item.url?.split('/collections/')[1] || null;
    onSelectCategory({ label: item.title, handle });
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.menuTitle}>CATEGORIES</Text>
          <ScrollView>
            {loading ? (
              <ActivityIndicator style={{ margin: 24 }} color="#8B6914" size="large" />
            ) : menuItems.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => handlePress(item)}
              >
                <Text style={styles.menuItemText}>{item.title}</Text>
                <Text style={styles.arrow}>›</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)' },
  backdrop: { flex: 1 },
  drawer: {
    width: 280, backgroundColor: '#fff',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
  },
  drawerHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingTop: 50, borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  logo: { width: 120, height: 40 },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 20, color: '#666' },
  menuTitle: {
    fontSize: 11, fontWeight: '700', color: '#999',
    paddingHorizontal: 20, paddingVertical: 12, letterSpacing: 1.5,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  menuItemText: { fontSize: 16, color: '#222', fontWeight: '500' },
  arrow: { fontSize: 20, color: '#8B6914' },
});