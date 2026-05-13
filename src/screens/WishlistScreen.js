// src/screens/WishlistScreen.js
import React from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function WishlistScreen({ navigation }) {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addItem } = useCart();

  if (!wishlist.length) return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>♡</Text>
      <Text style={styles.emptyText}>Your wishlist is empty</Text>
      <TouchableOpacity onPress={() => navigation.navigate('ShopTab')} style={styles.shopBtn}>
        <Text style={styles.shopBtnText}>Browse jewellery</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={wishlist}
      keyExtractor={i => i.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.row}>
          {item.featuredImage && (
            <TouchableOpacity onPress={() => navigation.navigate('Product', { id: item.id, title: item.title })}>
              <Image source={{ uri: item.featuredImage.url }} style={styles.thumb} />
            </TouchableOpacity>
          )}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.price}>
              ₹{parseFloat(item.priceRangeV2.minVariantPrice.amount).toLocaleString()}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('Product', { id: item.id, title: item.title })}
              >
                <Text style={styles.addBtnText}>View</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleWishlist(item)} style={styles.removeBtn}>
                <Text style={styles.removeText}>♥ Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyIcon: { fontSize: 56, color: '#c0392b', marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888', marginBottom: 20 },
  shopBtn: { backgroundColor: '#8B6914', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  row: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 10, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  thumb: { width: 100, height: 100, backgroundColor: '#f5f0e8' },
  info: { flex: 1, padding: 10 },
  name: { fontSize: 14, fontWeight: '500', color: '#222', marginBottom: 4 },
  price: { fontSize: 14, color: '#8B6914', fontWeight: '700', marginBottom: 10 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addBtn: { backgroundColor: '#8B6914', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  removeBtn: { padding: 4 },
  removeText: { color: '#c0392b', fontSize: 13 },
});
