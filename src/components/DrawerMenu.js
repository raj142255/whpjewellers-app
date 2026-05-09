import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal, // 1. Ensure this is explicitly here
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image'; // Renamed to avoid any 'Image' conflicts
import { fetchMenu } from '../api';

const LOGO_URL = 'https://cdn.shopify.com/s/files/1/0714/0419/1917/files/WHP_LOGO_9_10_25_2_brand_color_1.png?v=1765269037';

export default function DrawerMenu({ visible, onClose, onSelectCategory }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    if (visible && menuItems.length === 0) {
      setLoading(true);
      fetchMenu()
        .then(items => {
           console.log("Fetched Menu Items:", items.length);
           setMenuItems(items);
        })
        .catch(err => console.error("Menu fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [visible]);

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePress = (item) => {
    if (item.items && item.items.length > 0) {
      toggleExpand(item.id);
    } else {
      const handle = item.url?.split('/collections/')[1] || null;
      onSelectCategory({ label: item.title, handle });
      onClose();
    }
  };

  return (
    // 2. Using Modal as a top-level component
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <ExpoImage 
              source={{ uri: LOGO_URL }} 
              style={styles.logo} 
              contentFit="contain" 
            />
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.menuTitle}>CATEGORIES</Text>
          
          <ScrollView>
            {loading ? (
              <ActivityIndicator style={{ margin: 24 }} color="#8B6914" size="large" />
            ) : (
              menuItems.map((item) => (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => handlePress(item)}
                  >
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    {item.items?.length > 0 && (
                      <Text style={styles.arrow}>{expandedItems[item.id] ? '−' : '+'}</Text>
                    )}
                  </TouchableOpacity>

                  {/* Level 2 Sub-items */}
                  {expandedItems[item.id] && item.items?.map(subItem => (
                    <TouchableOpacity
                      key={subItem.id}
                      style={styles.subMenuItem}
                      onPress={() => handlePress(subItem)}
                    >
                      <Text style={styles.subMenuItemText}>{subItem.title}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))
            )}
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
  drawer: { width: 280, backgroundColor: '#fff' },
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
  subMenuItem: {
    paddingHorizontal: 35, paddingVertical: 12,
    backgroundColor: '#fafafa', borderBottomWidth: 1, borderBottomColor: '#eee',
  },
  subMenuItemText: { fontSize: 14, color: '#555' },
  arrow: { fontSize: 18, color: '#8B6914' },
});