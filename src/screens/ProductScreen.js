// src/screens/ProductScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, FlatList,
} from 'react-native';
import { fetchProduct } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductScreen({ route, navigation }) {
  const { id } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const { addItem } = useCart();

  useEffect(() => {
    fetchProduct(id)
      .then(p => {
        setProduct(p);
        setSelectedVariant(p.variants.edges[0]?.node || null);
      })
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator style={styles.center} size="large" color="#8B6914" />;
  if (!product) return null;

  const images = product.images.edges.map(e => e.url || e.node?.url || e);
  const variants = product.variants.edges.map(e => e.node);

  function handleAddToCart() {
    if (!selectedVariant) return;
    addItem({
      variantId: selectedVariant.id,
      title: product.title,
      variantTitle: selectedVariant.title,
      price: selectedVariant.price,
      image: product.images.edges[0]?.node?.url,
    });
    Alert.alert('Added to cart', product.title, [
      { text: 'Continue shopping' },
      { text: 'Go to cart', onPress: () => navigation.navigate('CartTab') },
    ]);
  }

  return (
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
          <Image source={{ uri: item.node.url }} style={styles.mainImage} />
        )}
      />
      {product.images.edges.length > 1 && (
        <View style={styles.dots}>
          {product.images.edges.map((_, i) => (
            <View key={i} style={[styles.dot, i === activeImage && styles.dotActive]} />
          ))}
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>
         INR {parseFloat(selectedVariant?.price || 0).toLocaleString()}
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

        <TouchableOpacity
          style={[styles.addBtn, !selectedVariant?.availableForSale && styles.addBtnDisabled]}
          onPress={handleAddToCart}
          disabled={!selectedVariant?.availableForSale}
        >
          <Text style={styles.addBtnText}>
            {selectedVariant?.availableForSale ? 'Add to cart' : 'Out of stock'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  title: { fontSize: 20, fontWeight: '600', color: '#1a1a1a', marginBottom: 6 },
  price: { fontSize: 18, color: '#8B6914', fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, color: '#666', marginBottom: 8, fontWeight: '500' },
  variants: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  variantBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 6, borderWidth: 1, borderColor: '#ddd',
  },
  variantSelected: { borderColor: '#8B6914', backgroundColor: '#8B6914' },
  variantText: { fontSize: 13, color: '#444' },
  variantTextSelected: { color: '#fff' },
  variantUnavailable: { color: '#bbb' },
  addBtn: {
    backgroundColor: '#8B6914', padding: 16,
    borderRadius: 10, alignItems: 'center', marginTop: 8,
  },
  addBtnDisabled: { backgroundColor: '#ccc' },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
