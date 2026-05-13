// src/screens/ProductScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, FlatList, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { fetchProduct, fetchProducts } from '../api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export default function ProductScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [accordion, setAccordion] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [snackbar, setSnackbar] = useState(false);
  const { addItem } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();
  const snackAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setLoading(true);
    fetchProduct(id)
      .then(p => {
        setProduct(p);
        setSelectedVariant(p.variants.edges[0]?.node || null);
      })
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
    // fetch similar products
    fetchProducts()
      .then(data => setSimilar(data.edges.map(e => e.node).filter(p => p.id !== id).slice(0, 6)))
      .catch(() => {});
  }, [id]);

  function showSnackbar() {
    setSnackbar(true);
    Animated.sequence([
      Animated.timing(snackAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(snackAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => setSnackbar(false));
  }

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      image: product.images.edges[0]?.node?.url,
    });
    showSnackbar();
  }

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#8B6914" />;
  if (!product) return null;

  const variants = product.variants.edges.map(e => e.node);
  const isWishlisted = wishlist.some(w => w.id === product.id);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        {/* Image carousel */}
        <FlatList
          data={product.images.edges}
          horizontal pagingEnabled
          keyExtractor={(_, i) => String(i)}
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={e => {
            setActiveImage(Math.round(e.nativeEvent.contentOffset.x / 375));
          }}
          renderItem={({ item }) => (
            <Image
              source={{ uri: item.node.url }}
              style={styles.mainImage}
              contentFit="cover"
              transition={300}
            />
          )}
        />
        {product.images.edges.length > 1 && (
          <View style={styles.dots}>
            {product.images.edges.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
            ))}
          </View>
        )}

        {/* Product info */}
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{product.title}</Text>
            <TouchableOpacity onPress={() => toggleWishlist(product)} style={styles.wishBtn}>
              <Text style={[styles.wishIcon, isWishlisted && styles.wishIconActive]}>
                {isWishlisted ? '♥' : '♡'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.price}>
            ₹{parseFloat(selectedVariant?.price || 0).toLocaleString()}
          </Text>

          {/* Variant selector */}
          {variants.length > 1 && (
            <View>
              <Text style={styles.label}>Select option</Text>
              <View style={styles.variants}>
                {variants.map(v => (
                  <TouchableOpacity
                    key={v.id}
                    style={[styles.variantBtn, selectedVariant?.id === v.id && styles.variantSelected]}
                    onPress={() => setSelectedVariant(v)}
                    disabled={!v.availableForSale}
                  >
                    <Text style={[
                      styles.variantText,
                      selectedVariant?.id === v.id && styles.variantTextSelected,
                      !v.availableForSale && styles.variantUnavailable,
                    ]}>
                      {v.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.addBtn, !selectedVariant?.availableForSale && styles.addBtnDisabled]}
              onPress={handleAddToCart}
              disabled={!selectedVariant?.availableForSale}
            >
              <Text style={styles.addBtnText}>
                {selectedVariant?.availableForSale ? '🛍️  Add to cart' : 'Out of stock'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.buyBtn, !selectedVariant?.availableForSale && styles.addBtnDisabled]}
             onPress={async () => {
  if (!selectedVariant) return;
  const { createCheckout } = require('../api');
  try {
    const checkout = await createCheckout([{ variantId: selectedVariant.id, quantity: 1 }]);
    navigation.navigate('CartTab', { directCheckout: checkout.webUrl });
  } catch(e) {
    Alert.alert('Error', e.message);
  }
}}
              disabled={!selectedVariant?.availableForSale}
            >
              <Text style={styles.buyBtnText}>Buy Now</Text>
            </TouchableOpacity>
          </View>

          {/* Accordion */}
          {[
            { key: 'description', label: 'Description', content: product.descriptionHtml?.replace(/<[^>]+>/g, '') || 'No description available.' },
            { key: 'details', label: 'Product Details', content: `SKU: ${product.id.split('/').pop()}` },
            { key: 'care', label: 'Care Instructions', content: 'Store in a cool dry place. Avoid contact with perfumes and chemicals.' },
          ].map(section => (
            <View key={section.key} style={styles.accordion}>
              <TouchableOpacity
                style={styles.accordionHeader}
                onPress={() => setAccordion(accordion === section.key ? null : section.key)}
              >
                <Text style={styles.accordionTitle}>{section.label}</Text>
                <Text style={styles.accordionArrow}>{accordion === section.key ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {accordion === section.key && (
                <Text style={styles.accordionContent}>{section.content}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Similar products */}
        {similar.length > 0 && (
          <View style={styles.similarSection}>
            <Text style={styles.similarTitle}>You may also like</Text>
            <FlatList
              data={similar}
              horizontal
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 12 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.similarCard}
                  onPress={() => navigation.push('Product', { id: item.id, title: item.title })}
                >
                  <Image
                    source={{ uri: item.featuredImage?.url }}
                    style={styles.similarImage}
                    contentFit="cover"
                    transition={300}
                  />
                  <Text style={styles.similarName} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.similarPrice}>
                    ₹{parseFloat(item.priceRangeV2.minVariantPrice.amount).toLocaleString()}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </ScrollView>

      {/* Snackbar */}
      {snackbar && (
        <Animated.View style={[styles.snackbar, { opacity: snackAnim }]}>
          <Text style={styles.snackbarText}>✓ Added to cart successfully!</Text>
          <TouchableOpacity onPress={() => navigation.navigate('CartTab')}>
            <Text style={styles.snackbarAction}>VIEW CART</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf8' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mainImage: { width: 375, height: 375, backgroundColor: '#f5f0e8' },
  dots: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd', margin: 3 },
  dotActive: { backgroundColor: '#8B6914' },
  info: { padding: 16 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 },
  title: { fontSize: 20, fontWeight: '600', color: '#1a1a1a', flex: 1, marginRight: 8 },
  wishBtn: { padding: 4 },
  wishIcon: { fontSize: 26, color: '#ccc' },
  wishIconActive: { color: '#c0392b' },
  price: { fontSize: 20, color: '#8B6914', fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, color: '#666', marginBottom: 8, fontWeight: '500' },
  variants: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  variantBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#ddd' },
  variantSelected: { borderColor: '#8B6914', backgroundColor: '#8B6914' },
  variantText: { fontSize: 13, color: '#444' },
  variantTextSelected: { color: '#fff' },
  variantUnavailable: { color: '#bbb' },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 8, marginBottom: 8 },
  addBtn: { flex: 1, backgroundColor: '#8B6914', padding: 14, borderRadius: 10, alignItems: 'center' },
  buyBtn: { flex: 1, backgroundColor: '#1a1a1a', padding: 14, borderRadius: 10, alignItems: 'center' },
  addBtnDisabled: { backgroundColor: '#ccc' },
  addBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  buyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  accordion: { borderTopWidth: 1, borderTopColor: '#eee', marginTop: 4 },
  accordionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  accordionTitle: { fontSize: 14, fontWeight: '600', color: '#222' },
  accordionArrow: { fontSize: 12, color: '#8B6914' },
  accordionContent: { fontSize: 13, color: '#666', lineHeight: 22, paddingBottom: 14 },
  similarSection: { paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#eee', marginTop: 8 },
  similarTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginLeft: 16, marginBottom: 12 },
  similarCard: { width: 140, marginRight: 12, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', elevation: 2 },
  similarImage: { width: 140, height: 140, backgroundColor: '#f5f0e8' },
  similarName: { fontSize: 12, fontWeight: '500', color: '#222', margin: 8, marginBottom: 2 },
  similarPrice: { fontSize: 12, color: '#8B6914', fontWeight: '700', marginHorizontal: 8, marginBottom: 8 },
  snackbar: {
    position: 'absolute', bottom: 20, left: 16, right: 16,
    backgroundColor: '#1a1a1a', borderRadius: 8, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 6,
  },
  snackbarText: { color: '#fff', fontSize: 13, fontWeight: '500' },
  snackbarAction: { color: '#8B6914', fontSize: 13, fontWeight: '700' },
});