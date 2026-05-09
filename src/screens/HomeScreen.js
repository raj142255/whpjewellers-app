// src/screens/HomeScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, TextInput, SafeAreaView, StatusBar,
} from 'react-native';
import { fetchProducts } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import DrawerMenu from '../components/DrawerMenu';

const LOGO_URL = 'https://cdn.shopify.com/s/files/1/0714/0419/1917/files/WHP_LOGO_9_10_25_2_brand_color_1.png?v=1765269037';

function Header({ navigation, searchQuery, setSearchQuery, onOpenDrawer }) {
  const { count } = useCart();
  const { wishlist } = useWishlist();
  return (
    <SafeAreaView style={styles.safeHeader} edges={['top']}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <View style={styles.headerTop}>
        <TouchableOpacity onPress={onOpenDrawer} style={styles.hamburger}>
          <Text style={styles.hamburgerIcon}>☰</Text>
        </TouchableOpacity>
        <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={() => navigation.navigate('WishlistTab')} style={styles.iconBtn}>
            <Text style={styles.iconText}>♡</Text>
            {wishlist.length > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{wishlist.length}</Text></View>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('CartTab')} style={styles.iconBtn}>
            <Text style={styles.iconText}>🛍️</Text>
            {count > 0 && (
              <View style={styles.badge}><Text style={styles.badgeText}>{count}</Text></View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search jewellery..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { wishlist, toggleWishlist } = useWishlist();

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchProducts();
      setProducts(data.edges.map(e => e.node));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function handleCategory(cat) {
    if (!cat.handle) {
      load();
    } else {
      navigation.navigate('Category', { title: cat.label, handle: cat.handle });
    }
  }

  const filtered = products.filter(p =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Header
        navigation={navigation}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenDrawer={() => setDrawerVisible(true)}
      />
      {loading ? (
        <ActivityIndicator style={styles.center} size="large" color="#8B6914" />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity onPress={load} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.grid}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
          ListEmptyComponent={<Text style={styles.noResults}>No products found</Text>}
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
                    <Text style={[styles.wishlistIcon, isWishlisted && styles.wishlistIconActive]}>
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
      )}
      <DrawerMenu
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        onSelectCategory={handleCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf8' },
  safeHeader: { backgroundColor: '#fff', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, paddingTop: 14, paddingBottom: 10 },
  hamburger: { padding: 8 },
  hamburgerIcon: { fontSize: 24, color: '#222' },
  logo: { width: 120, height: 40 },
  headerIcons: { flexDirection: 'row', gap: 4 },
  iconBtn: { padding: 8, position: 'relative' },
  iconText: { fontSize: 22 },
  badge: {
    position: 'absolute', top: 2, right: 2,
    backgroundColor: '#c0392b', borderRadius: 8,
    minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 10,
    marginHorizontal: 16, marginBottom: 10, paddingHorizontal: 10,
  },
  searchIcon: { fontSize: 15, marginRight: 6 },
  searchInput: { flex: 1, height: 38, fontSize: 14, color: '#222' },
  clearIcon: { fontSize: 14, color: '#999', padding: 4 },
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
  wishlistIconActive: { color: '#c0392b' },
  title: { fontSize: 13, fontWeight: '500', margin: 8, marginBottom: 2, color: '#222' },
  price: { fontSize: 13, color: '#8B6914', fontWeight: '600', marginHorizontal: 8, marginBottom: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#c00', marginBottom: 12 },
  retryBtn: { backgroundColor: '#8B6914', padding: 10, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '600' },
  noResults: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 15 },
});
