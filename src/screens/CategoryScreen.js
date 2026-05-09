// src/screens/CategoryScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { fetchProductsByCollection } from '../api';
import { useWishlist } from '../context/WishlistContext';

export default function CategoryScreen({ route, navigation }) {
  const { title, handle } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { wishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    fetchProductsByCollection(handle)
      .then(data => setProducts(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [handle]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#8B6914" />;
  if (error) return <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>;
  if (!products.length) return <View style={styles.center}><Text style={styles.empty}>No products found</Text></View>;

  return (
    <FlatList
      data={products}
      numColumns={2}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.grid}
      renderItem={({ item }) => {
        const isWishlisted = wishlist.some(w => w.id === item.id);
        return (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Product', { id: item.id, title: item.title })}
          >
            <View style={styles.imageContainer}>
              {item.featuredImage ? (
                <Image source={{ uri: item.featuredImage.url }} style={styles.image} />
              ) : (
                <View style={[styles.image, styles.noImage]}>
                  <Text style={styles.noImageText}>No image</Text>
                </View>
              )}
              <TouchableOpacity style={styles.wishlistBtn} onPress={() => toggleWishlist(item)}>
                <Text style={[styles.wishlistIcon, isWishlisted && styles.wishlistActive]}>
                  {isWishlisted ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
            <Text style={styles.price}>
              ₹{parseFloat(item.priceRangeV2.minVariantPrice.amount).toLocaleString()}
            </Text>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#c00' },
  empty: { color: '#999', fontSize: 15 },
  grid: { padding: 8 },
  card: {
    flex: 1, margin: 6, backgroundColor: '#fff',
    borderRadius: 10, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, elevation: 2,
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 160, backgroundColor: '#f5f0e8' },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  noImageText: { color: '#999', fontSize: 12 },
  wishlistBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20,
    width: 32, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  wishlistIcon: { fontSize: 18, color: '#999' },
  wishlistActive: { color: '#c0392b' },
  title: { fontSize: 13, fontWeight: '500', margin: 8, marginBottom: 2, color: '#222' },
  price: { fontSize: 13, color: '#8B6914', fontWeight: '600', marginHorizontal: 8, marginBottom: 10 },
});
