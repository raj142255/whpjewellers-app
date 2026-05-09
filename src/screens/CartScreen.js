// src/screens/CartScreen.js
import React, { useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Alert, Modal, SafeAreaView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useCart } from '../context/CartContext';
import { createCheckout } from '../api';

export default function CartScreen() {
  const { items, removeItem, updateQty, total } = useCart();
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!items.length) return;
    setLoading(true);
    try {
      const lineItems = items.map(i => ({ variantId: i.variantId, quantity: i.quantity }));
      const checkout = await createCheckout(lineItems);
      setCheckoutUrl(checkout.webUrl);
    } catch (e) {
      Alert.alert('Checkout error', e.message);
    } finally {
      setLoading(false);
    }
  }

  if (!items.length) return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>🛍️</Text>
      <Text style={styles.emptyText}>Your cart is empty</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={i => i.variantId}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image && <Image source={{ uri: item.image }} style={styles.thumb} />}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.title}</Text>
              {item.variantTitle !== 'Default Title' && (
                <Text style={styles.variant}>{item.variantTitle}</Text>
              )}
              <Text style={styles.price}>
                ₹{parseFloat(item.price).toLocaleString()}
              </Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity onPress={() => updateQty(item.variantId, item.quantity - 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.qty}>{item.quantity}</Text>
                <TouchableOpacity onPress={() => updateQty(item.variantId, item.quantity + 1)} style={styles.qtyBtn}>
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeItem(item.variantId)} style={styles.removeBtn}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            ₹{total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutBtn, loading && styles.checkoutBtnDisabled]}
          onPress={handleCheckout}
          disabled={loading}
        >
          <Text style={styles.checkoutText}>
            {loading ? 'Loading...' : 'Proceed to checkout'}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal visible={!!checkoutUrl} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.webviewHeader}>
            <TouchableOpacity onPress={() => setCheckoutUrl(null)} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.webviewTitle}>Checkout</Text>
            <View style={{ width: 70 }} />
          </View>
          <WebView source={{ uri: checkoutUrl }} style={{ flex: 1 }} startInLoadingState />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafaf8' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888' },
  row: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderRadius: 10, marginBottom: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  thumb: { width: 90, height: 90, backgroundColor: '#f5f0e8' },
  info: { flex: 1, padding: 10 },
  name: { fontSize: 14, fontWeight: '500', color: '#222', marginBottom: 2 },
  variant: { fontSize: 12, color: '#888', marginBottom: 4 },
  price: { fontSize: 14, color: '#8B6914', fontWeight: '700', marginBottom: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: 6, borderWidth: 1,
    borderColor: '#ddd', alignItems: 'center', justifyContent: 'center',
  },
  qtyBtnText: { fontSize: 16, color: '#444' },
  qty: { fontSize: 14, fontWeight: '600', minWidth: 20, textAlign: 'center' },
  removeBtn: { marginLeft: 'auto' },
  removeText: { fontSize: 12, color: '#c00' },
  footer: {
    padding: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#eee',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  totalLabel: { fontSize: 16, fontWeight: '600', color: '#222' },
  totalAmount: { fontSize: 18, fontWeight: '700', color: '#8B6914' },
  checkoutBtn: {
    backgroundColor: '#8B6914', padding: 16,
    borderRadius: 10, alignItems: 'center',
  },
  checkoutBtnDisabled: { backgroundColor: '#ccc' },
  checkoutText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  webviewHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 12, backgroundColor: '#8B6914',
  },
  closeBtn: { padding: 4 },
  closeText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  webviewTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
});