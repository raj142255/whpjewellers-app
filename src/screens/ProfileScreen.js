// src/screens/ProfileScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Animated,
  SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const API_BASE = 'https://yellowgreen-jay-842557.hostingersite.com';
const GOLD     = '#8B6914';
const GOLD_LIGHT = '#F5EDD3';

// ── Accordion Section ─────────────────────────────────────
function AccordionSection({ title, icon, count, isOpen, onToggle, children, loading }) {
  const rotateAnim = React.useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={acc.wrapper}>
      <TouchableOpacity style={acc.header} onPress={onToggle} activeOpacity={0.75}>
        <View style={acc.left}>
          <View style={acc.iconBox}>
            <Ionicons name={icon} size={18} color={GOLD} />
          </View>
          <Text style={acc.title}>{title}</Text>
          {count !== undefined && count !== null && (
            <View style={acc.badge}>
              <Text style={acc.badgeText}>{count}</Text>
            </View>
          )}
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={18} color="#999" />
        </Animated.View>
      </TouchableOpacity>

      {isOpen && (
        <View style={acc.body}>
          {loading
            ? <ActivityIndicator color={GOLD} style={{ marginVertical: 24 }} />
            : children}
        </View>
      )}
    </View>
  );
}

// ── Order Card ────────────────────────────────────────────
function OrderCard({ order }) {
  const isFulfilled = order.fulfillmentStatus === 'FULFILLED' ||
                      order.fulfillment_status === 'fulfilled';
  const statusLabel = isFulfilled ? 'Fulfilled' : 'Unfulfilled';
  const statusColor = isFulfilled ? '#2E7D32' : '#8B6914';
  const statusBg    = isFulfilled ? '#E8F5E9' : GOLD_LIGHT;

  const orderNum   = order.orderNumber || order.order_number || order.name || '—';
  const dateRaw    = order.processedAt || order.created_at || order.processedAt;
  const dateStr    = dateRaw
    ? new Date(dateRaw).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const total      = order.totalPrice || order.totalPriceV2?.amount || order.total_price || '0';
  const currency   = order.totalPriceV2?.currencyCode || 'INR';
  const items      = order.lineItems || order.lineItems?.edges || order.line_items || [];

  const symbol = currency === 'INR' ? '₹' : currency;

  return (
    <View style={card.wrapper}>
      <View style={card.topRow}>
        <Text style={card.orderNum}>
          {String(orderNum).startsWith('#') ? orderNum : `#${orderNum}`}
        </Text>
        <View style={[card.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[card.statusText, { color: statusColor }]}>{statusLabel.toUpperCase()}</Text>
        </View>
      </View>
      {dateStr ? <Text style={card.date}>{dateStr}</Text> : null}
      <Text style={card.price}>{symbol}{parseFloat(total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      {items.slice(0, 3).map((item, i) => {
        const name = item.title || item.node?.title || item.name || '';
        const qty  = item.quantity || item.node?.quantity || 1;
        return name
          ? <Text key={i} style={card.item}>• {name} × {qty}</Text>
          : null;
      })}
      {items.length > 3 && (
        <Text style={card.item}>+{items.length - 3} more items</Text>
      )}
    </View>
  );
}

// ── Address Card ──────────────────────────────────────────
function AddressCard({ address, onDelete, onSetDefault }) {
  const name    = [address.first_name, address.last_name].filter(Boolean).join(' ') || address.name || '';
  const line1   = address.address1 || '';
  const line2   = address.address2 || '';
  const city    = [address.city, address.province, address.zip].filter(Boolean).join(', ');
  const isDefault = address.default;

  return (
    <View style={[addrCard.wrapper, isDefault && addrCard.defaultWrapper]}>
      {isDefault && (
        <View style={addrCard.defaultBadge}>
          <Text style={addrCard.defaultText}>DEFAULT</Text>
        </View>
      )}
      <Text style={addrCard.name}>{name}</Text>
      {line1 ? <Text style={addrCard.line}>{line1}</Text> : null}
      {line2 ? <Text style={addrCard.line}>{line2}</Text> : null}
      {city  ? <Text style={addrCard.line}>{city}</Text>  : null}
      {address.phone ? <Text style={addrCard.phone}>{address.phone}</Text> : null}
      <View style={addrCard.actions}>
        {!isDefault && (
          <TouchableOpacity onPress={() => onSetDefault(address.id)} style={addrCard.actionBtn}>
            <Text style={addrCard.actionText}>Set Default</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => onDelete(address.id)} style={[addrCard.actionBtn, addrCard.deleteBtn]}>
          <Ionicons name="trash-outline" size={14} color="#c62828" />
          <Text style={[addrCard.actionText, { color: '#c62828', marginLeft: 4 }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Scheme Card ───────────────────────────────────────────
function SchemeCard({ scheme }) {
  const paid     = scheme.payments_made || 0;
  const total    = scheme.tenure_months || 11;
  const isComplete = status === "complete" || status === "completed" || status === "matured";
  const progress = isComplete ? 1 : Math.min(paid / total, 1);
  const amount   = scheme.instalment_amt || 0;
  const status   = (scheme.status || 'active').toLowerCase();
  const name     = scheme.scheme_name || scheme.name || `Scheme #${scheme.id}`;

  return (
    <View style={schCard.wrapper}>
      <View style={schCard.topRow}>
        <Text style={schCard.name}>{name}</Text>
        <View style={[schCard.badge, { backgroundColor: status === 'active' ? '#E8F5E9' : status === 'matured' || status === 'completed' ? '#E3F2FD' : '#FFF8E1' }]}>
          <Text style={[schCard.badgeText, { color: status === 'active' ? '#2E7D32' : status === 'matured' || status === 'completed' ? '#1565C0' : GOLD }]}>
            {status.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={schCard.sub}>₹{Number(amount).toLocaleString('en-IN')} / month · {total} months</Text>
      <View style={schCard.progressBg}>
        <View style={[schCard.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={schCard.progressText}>{paid} of {total} months paid</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [openSection, setOpenSection] = useState('orders');
  const [orders,    setOrders]    = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [schemes,   setSchemes]   = useState([]);
  const [loadOrders,    setLoadOrders]    = useState(false);
  const [loadAddresses, setLoadAddresses] = useState(false);
  const [loadSchemes,   setLoadSchemes]   = useState(false);
  const [fetchedOrders,    setFetchedOrders]    = useState(false);
  const [fetchedAddresses, setFetchedAddresses] = useState(false);
  const [fetchedSchemes,   setFetchedSchemes]   = useState(false);

  // Lazy fetch — only when section opens for the first time
  const toggle = useCallback((section) => {
    setOpenSection(prev => prev === section ? null : section);
  }, []);

  useEffect(() => {
    if (openSection === 'orders' && !fetchedOrders && user?.token) {
      setLoadOrders(true);
      setFetchedOrders(true);
      fetch(`${API_BASE}/api/app/orders`, {
        headers: { 'x-app-token': user.token }
      })
        .then(r => r.json())
        .then(d => { console.log('ORDERS_API:', JSON.stringify(d?.orders?.[0], null, 2)); if (d.success) setOrders(d.orders || []); })
        .catch(e => console.log('ORDERS_ERR:', e))
        .finally(() => setLoadOrders(false));
    }
  }, [openSection, fetchedOrders, user]);

  useEffect(() => {
    if (openSection === 'addresses' && !fetchedAddresses && user?.token) {
      setLoadAddresses(true);
      setFetchedAddresses(true);
      fetch(`${API_BASE}/api/app/addresses`, {
        headers: { 'x-app-token': user.token }
      })
        .then(r => r.json())
        .then(d => { if (d.success) setAddresses(d.addresses || []); })
        .catch(() => {})
        .finally(() => setLoadAddresses(false));
    }
  }, [openSection, fetchedAddresses, user]);

  useEffect(() => {
    if (openSection === 'schemes' && !fetchedSchemes && user?.gmsToken) {
      setLoadSchemes(true);
      setFetchedSchemes(true);
      fetch(`${API_BASE}/api/gms/me`, {
        headers: { 'x-user-token': user.gmsToken }
      })
        .then(r => r.json())
        .then(d => { console.log('SCHEMES_API:', JSON.stringify(d, null, 2)); if (d.success) setSchemes(d.enrolments || d.schemes || d.user?.schemes || d.data || []); })
        .catch(e => console.log('SCHEMES_ERR:', e))
        .finally(() => setLoadSchemes(false));
    }
  }, [openSection, fetchedSchemes, user]);

  const handleDeleteAddress = useCallback((id) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            const r = await fetch(`${API_BASE}/api/app/addresses/${id}`, {
              method: 'DELETE',
              headers: { 'x-app-token': user.token }
            });
            const d = await r.json();
            if (d.success) setAddresses(prev => prev.filter(a => a.id !== id));
            else Alert.alert('Error', d.message || 'Could not delete');
          } catch { Alert.alert('Error', 'Network error'); }
        }
      }
    ]);
  }, [user]);

  const handleSetDefault = useCallback(async (id) => {
    try {
      const r = await fetch(`${API_BASE}/api/app/addresses/${id}/default`, {
        method: 'POST',
        headers: { 'x-app-token': user.token }
      });
      const d = await r.json();
      if (d.success) {
        setAddresses(prev => prev.map(a => ({ ...a, default: a.id === id })));
      }
    } catch {}
  }, [user]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  // ── Not logged in ─────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.loggedOut}>
          <View style={styles.loggedOutIcon}>
            <Ionicons name="person-outline" size={48} color={GOLD} />
          </View>
          <Text style={styles.loggedOutTitle}>You're not logged in</Text>
          <Text style={styles.loggedOutSub}>Login to view orders, addresses and schemes</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginBtnText}>Login / Register</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── Avatar initials ───────────────────────────────────
  const displayName = user.name || 'WHP Customer';
  const initials = displayName !== 'WHP Customer'
    ? displayName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : (user.mobile?.slice(-2) || 'U');

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top > 0 ? insets.top : (Platform.OS === "android" ? StatusBar.currentHeight || 24 : 0) }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile Header ── */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            {/* Online dot */}
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profilePhone}>+91 {user.mobile}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Orders Accordion ── */}
        <AccordionSection
          title="My Orders"
          icon="bag-outline"
          count={orders.length || undefined}
          isOpen={openSection === 'orders'}
          onToggle={() => toggle('orders')}
          loading={loadOrders}
        >
          {orders.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="bag-outline" size={36} color="#ccc" />
              <Text style={styles.emptyText}>No orders yet</Text>
            </View>
          ) : (
            orders.map((order, i) => <OrderCard key={order.id || i} order={order} />)
          )}
        </AccordionSection>

        {/* ── Addresses Accordion ── */}
        <AccordionSection
          title="My Addresses"
          icon="location-outline"
          count={addresses.length || undefined}
          isOpen={openSection === 'addresses'}
          onToggle={() => toggle('addresses')}
          loading={loadAddresses}
        >
          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={36} color="#ccc" />
              <Text style={styles.emptyText}>No saved addresses</Text>
            </View>
          ) : (
            addresses.map((addr, i) => (
              <AddressCard
                key={addr.id || i}
                address={addr}
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefault}
              />
            ))
          )}
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => Alert.alert('Coming Soon', 'Add address feature will be available soon.')}
          >
            <Ionicons name="add-circle-outline" size={18} color={GOLD} />
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        </AccordionSection>

        {/* ── My Schemes Accordion ── */}
        <AccordionSection
          title="My Schemes"
          icon="diamond-outline"
          count={schemes.length || undefined}
          isOpen={openSection === 'schemes'}
          onToggle={() => toggle('schemes')}
          loading={loadSchemes}
        >
          {!user.gmsToken ? (
            <View style={styles.emptyState}>
              <Ionicons name="diamond-outline" size={36} color="#ccc" />
              <Text style={styles.emptyText}>No schemes enrolled</Text>
              <Text style={styles.emptySubText}>Visit the Schemes tab to enroll</Text>
            </View>
          ) : schemes.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="diamond-outline" size={36} color="#ccc" />
              <Text style={styles.emptyText}>No schemes enrolled</Text>
            </View>
          ) : (
            schemes.map((s, i) => <SchemeCard key={s.id || i} scheme={s} />)
          )}
        </AccordionSection>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scroll: { flex: 1, backgroundColor: '#F7F7F7' },
  scrollContent: { paddingBottom: 24 },

  // Profile card
  profileCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 14,
  },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: GOLD,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 12, height: 12, borderRadius: 6,
    backgroundColor: '#43A047',
    borderWidth: 2, borderColor: '#fff',
  },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  profilePhone: { fontSize: 13, color: '#777', marginTop: 2 },
  logoutBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#e0e0e0' },
  logoutText: { color: GOLD, fontWeight: '600', fontSize: 13 },

  divider: { height: 8, backgroundColor: '#F0F0F0' },

  // Empty state
  emptyState: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyText: { color: '#aaa', fontSize: 14, fontWeight: '500' },
  emptySubText: { color: '#bbb', fontSize: 12 },

  // Add button
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 12, paddingVertical: 10, paddingHorizontal: 14,
    borderWidth: 1, borderColor: GOLD_LIGHT, borderRadius: 8,
    backgroundColor: '#FDFAF3', alignSelf: 'flex-start',
  },
  addBtnText: { color: GOLD, fontWeight: '600', fontSize: 14 },

  // Not logged in
  loggedOut: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  loggedOutIcon: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: GOLD_LIGHT, alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  loggedOutTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  loggedOutSub: { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20 },
  loginBtn: { backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10, marginTop: 8 },
  loginBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

// ── Accordion styles ──────────────────────────────────────
const acc = StyleSheet.create({
  wrapper: { backgroundColor: '#fff', marginTop: 8 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingVertical: 16,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: {
    width: 34, height: 34, borderRadius: 9,
    backgroundColor: GOLD_LIGHT, alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  badge: {
    backgroundColor: GOLD, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2, marginLeft: 6,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  body: { paddingHorizontal: 14, paddingBottom: 14 },
});

// ── Order card styles ─────────────────────────────────────
const card = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FAFAFA', borderRadius: 10,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: 14, fontWeight: '700', color: '#1a1a1a' },
  statusBadge: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  date: { color: '#999', fontSize: 12, marginTop: 4 },
  price: { color: GOLD, fontSize: 16, fontWeight: '700', marginTop: 6, marginBottom: 6 },
  item: { color: '#555', fontSize: 12, lineHeight: 19 },
});

// ── Address card styles ───────────────────────────────────
const addrCard = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FAFAFA', borderRadius: 10,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  defaultWrapper: { borderColor: GOLD, borderWidth: 1.5 },
  defaultBadge: {
    alignSelf: 'flex-start', backgroundColor: GOLD_LIGHT,
    borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2, marginBottom: 8,
  },
  defaultText: { color: GOLD, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  name: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  line: { fontSize: 13, color: '#555', lineHeight: 20 },
  phone: { fontSize: 12, color: '#888', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 12 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 6, borderWidth: 1, borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  deleteBtn: { borderColor: '#ffcdd2' },
  actionText: { fontSize: 12, fontWeight: '600', color: '#555' },
});

// ── Scheme card styles ────────────────────────────────────
const schCard = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FAFAFA', borderRadius: 10,
    padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: '#EFEFEF',
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: '#1a1a1a', flex: 1, marginRight: 8 },
  badge: { borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  sub: { color: '#777', fontSize: 12, marginTop: 4, marginBottom: 10 },
  progressBg: {
    height: 6, backgroundColor: '#E8E8E8', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: 6, backgroundColor: GOLD, borderRadius: 3,
  },
  progressText: { color: '#999', fontSize: 11, marginTop: 6 },
});