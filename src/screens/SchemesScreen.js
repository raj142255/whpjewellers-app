// src/screens/SchemesScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const API_BASE   = 'https://yellowgreen-jay-842557.hostingersite.com';
const GOLD       = '#8B6914';
const GOLD_LIGHT = '#F5EDD3';

// ── Coupon Card ───────────────────────────────────────────
function CouponCard({ code, redeemable }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    Clipboard.setString(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <View style={coupon.wrapper}>
      <View style={{ flex: 1 }}>
        <Text style={coupon.label}>REDEMPTION COUPON</Text>
        <Text style={coupon.code}>{code}</Text>
        <Text style={coupon.sub}>
          Worth ₹{parseFloat(redeemable).toLocaleString('en-IN')} · Use at WHP stores
        </Text>
      </View>
      <TouchableOpacity style={[coupon.btn, copied && coupon.btnCopied]} onPress={copy}>
        <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={14} color={copied ? '#fff' : GOLD} />
        <Text style={[coupon.btnText, copied && { color: '#fff' }]}>
          {copied ? 'Copied!' : 'Copy'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Scheme Card ───────────────────────────────────────────
function SchemeCard({ scheme }) {
  const status       = (scheme.status || 'pending').toLowerCase();
  const isComplete   = status === 'complete' || status === 'completed' || status === 'matured';
  const paid         = scheme.payments_made    || 0;
  const payMonths    = scheme.pay_months       || scheme.tenure_months || 1;
  const tenureMonths = scheme.tenure_months    || payMonths;
  const bonusMonths  = Math.max(tenureMonths - payMonths, 0);
  const monthly      = parseFloat(scheme.instalment_amt     || 0);
  const invested     = parseFloat(scheme.total_contribution || 0);
  const redeemable   = parseFloat(scheme.total_redeemable   || 0);
  const bonus        = parseFloat(scheme.whp_bonus          || 0);
  const bonusPct     = parseFloat(scheme.bonus_pct          || 0);
  const pct          = isComplete ? 100 : Math.min(Math.round((paid / payMonths) * 100), 100);

  const maturityStr  = scheme.maturity_date
    ? new Date(scheme.maturity_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'N/A';
  const enrolStr     = scheme.enrolment_date
    ? new Date(scheme.enrolment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const badgeBg    = isComplete               ? '#E3F2FD'
                   : status === 'active'       ? '#E8F5E9'
                   : status === 'paused'       ? '#FFF8E1'
                   : status === 'discontinued' ? '#FFEBEE'
                   : '#F5F5F5';
  const badgeColor = isComplete               ? '#1565C0'
                   : status === 'active'       ? '#2E7D32'
                   : status === 'paused'       ? GOLD
                   : status === 'discontinued' ? '#C62828'
                   : '#666';
  const fillColor  = pct === 100 ? '#2E7D32' : GOLD;

  return (
    <View style={sc.card}>
      {/* Header */}
      <View style={sc.header}>
        <View style={{ flex: 1 }}>
          <Text style={sc.schemeName}>{scheme.scheme_name || 'WHP Scheme'}</Text>
          <Text style={sc.schemeId}>
            #{scheme.enrolment_id}{enrolStr ? ` · Enrolled ${enrolStr}` : ''}
          </Text>
        </View>
        <View style={[sc.badge, { backgroundColor: badgeBg }]}>
          <Text style={[sc.badgeText, { color: badgeColor }]}>{status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={sc.progressSection}>
        <View style={sc.progressRow}>
          <Text style={sc.progressLabel}>
            {paid} of {payMonths} months paid
            {bonusMonths > 0 ? ` (+${bonusMonths} WHP bonus)` : ''}
          </Text>
          <Text style={[sc.progressPct, { color: fillColor }]}>{pct}%</Text>
        </View>
        <View style={sc.progressBg}>
          <View style={[sc.progressFill, { width: `${pct}%`, backgroundColor: fillColor }]} />
        </View>
      </View>

      {/* Stats row */}
      <View style={sc.statsRow}>
        <View style={sc.statItem}>
          <Text style={sc.statLabel}>Monthly</Text>
          <Text style={sc.statValue}>₹{monthly.toLocaleString('en-IN')}</Text>
        </View>
        <View style={sc.statDiv} />
        <View style={sc.statItem}>
          <Text style={sc.statLabel}>Invested</Text>
          <Text style={sc.statValue}>₹{invested.toLocaleString('en-IN')}</Text>
        </View>
        <View style={sc.statDiv} />
        <View style={sc.statItem}>
          <Text style={sc.statLabel}>Maturity</Text>
          <Text style={sc.statValue}>{maturityStr}</Text>
        </View>
      </View>

      {/* Redeemable value */}
      {redeemable > 0 && (
        <View style={sc.redeemBox}>
          <View>
            <Text style={sc.redeemLabel}>Total Redeemable</Text>
            <Text style={sc.redeemValue}>₹{redeemable.toLocaleString('en-IN')}</Text>
          </View>
          {bonus > 0 && (
            <View style={sc.bonusBadge}>
              <Ionicons name="gift-outline" size={12} color="#2E7D32" />
              <Text style={sc.bonusText}>
                +₹{bonus.toLocaleString('en-IN')} bonus ({bonusPct}%)
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Branch */}
      {scheme.preferred_branch ? (
        <View style={sc.branchRow}>
          <Ionicons name="location-outline" size={13} color="#aaa" />
          <Text style={sc.branchText}>{scheme.preferred_branch} Branch</Text>
        </View>
      ) : null}

      {/* Coupon */}
      {scheme.coupon_code ? (
        <CouponCard code={scheme.coupon_code} redeemable={redeemable} />
      ) : null}
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────
export default function SchemesScreen({ navigation }) {
  const { user }                       = useAuth();
  const [data,       setData]          = useState(null);
  const [loading,    setLoading]       = useState(true);
  const [refreshing, setRefreshing]    = useState(false);

  useEffect(() => {
    if (user?.gmsToken) fetchData();
    else setLoading(false);
  }, [user]);

  async function fetchData() {
    try {
      const r    = await fetch(`${API_BASE}/api/gms/me`, {
        headers: { 'x-user-token': user.gmsToken },
      });
      const json = await r.json();
      if (json.success) setData(json);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  if (!user) return (
    <View style={s.centered}>
      <View style={s.iconWrap}><Ionicons name="diamond-outline" size={40} color={GOLD} /></View>
      <Text style={s.centeredTitle}>Login to view schemes</Text>
      <TouchableOpacity style={s.actionBtn} onPress={() => navigation.navigate('ProfileTab')}>
        <Text style={s.actionBtnText}>Login / Register</Text>
      </TouchableOpacity>
    </View>
  );

  if (!user.gmsToken) return (
    <View style={s.centered}>
      <View style={s.iconWrap}><Ionicons name="diamond-outline" size={40} color={GOLD} /></View>
      <Text style={s.centeredTitle}>No GMS account found</Text>
      <Text style={s.centeredSub}>No WHP scheme account linked to this number</Text>
    </View>
  );

  if (loading) return (
    <View style={s.centered}><ActivityIndicator size="large" color={GOLD} /></View>
  );

  const enrolments    = data?.enrolments || [];
  const activeCount   = enrolments.filter(e => (e.status||'').toLowerCase() === 'active').length;
  const totalInvested = enrolments.reduce((sum, e) => sum + parseFloat(e.total_contribution || 0), 0);

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchData(); }}
          colors={[GOLD]} tintColor={GOLD}
        />
      }
    >
      {/* Summary */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <Text style={s.summaryVal}>{enrolments.length}</Text>
          <Text style={s.summaryLbl}>Total</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryVal, { color: '#2E7D32' }]}>{activeCount}</Text>
          <Text style={s.summaryLbl}>Active</Text>
        </View>
        <View style={s.summaryCard}>
          <Text style={[s.summaryVal, { color: GOLD, fontSize: 14 }]}>
            ₹{totalInvested.toLocaleString('en-IN')}
          </Text>
          <Text style={s.summaryLbl}>Invested</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>My Schemes</Text>

      {enrolments.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="diamond-outline" size={48} color="#ddd" />
          <Text style={s.emptyText}>No schemes yet</Text>
          <Text style={s.emptySub}>Visit a WHP store to enroll in a jewellery saving scheme</Text>
        </View>
      ) : (
        enrolments.map((scheme, idx) => (
          <SchemeCard key={scheme.enrolment_id || idx} scheme={scheme} />
        ))
      )}
      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ── Main styles ───────────────────────────────────────────
const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F7F7F7' },
  content:       { paddingBottom: 32 },
  centered:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  iconWrap:      { width: 80, height: 80, borderRadius: 40, backgroundColor: GOLD_LIGHT, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  centeredTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', textAlign: 'center' },
  centeredSub:   { fontSize: 14, color: '#777', textAlign: 'center', lineHeight: 20 },
  actionBtn:     { backgroundColor: GOLD, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 10, marginTop: 8 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  summaryRow:    { flexDirection: 'row', gap: 10, margin: 16, marginBottom: 8 },
  summaryCard:   { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4 },
  summaryVal:    { fontSize: 20, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  summaryLbl:    { fontSize: 11, color: '#888', fontWeight: '500' },
  sectionTitle:  { fontSize: 15, fontWeight: '700', color: '#1a1a1a', marginHorizontal: 16, marginTop: 8, marginBottom: 10 },
  empty:         { alignItems: 'center', padding: 48, gap: 10 },
  emptyText:     { fontSize: 16, color: '#999', fontWeight: '600' },
  emptySub:      { fontSize: 13, color: '#bbb', textAlign: 'center', lineHeight: 20 },
});

// ── Scheme card styles ────────────────────────────────────
const sc = StyleSheet.create({
  card:          { backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 14, borderRadius: 14, padding: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.07, shadowRadius: 8 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  schemeName:    { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },
  schemeId:      { fontSize: 11, color: '#999', marginTop: 3 },
  badge:         { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText:     { fontSize: 11, fontWeight: '700' },
  progressSection: { marginBottom: 14 },
  progressRow:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { fontSize: 12, color: '#666' },
  progressPct:   { fontSize: 12, fontWeight: '700' },
  progressBg:    { height: 7, backgroundColor: '#F0F0F0', borderRadius: 4, overflow: 'hidden' },
  progressFill:  { height: '100%', borderRadius: 4 },
  statsRow:      { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 12, marginBottom: 12 },
  statItem:      { flex: 1, alignItems: 'center' },
  statDiv:       { width: 1, backgroundColor: '#F0F0F0' },
  statLabel:     { fontSize: 11, color: '#999', marginBottom: 3 },
  statValue:     { fontSize: 13, fontWeight: '700', color: '#1a1a1a' },
  redeemBox:     { backgroundColor: GOLD_LIGHT, borderRadius: 10, padding: 12, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  redeemLabel:   { fontSize: 11, color: GOLD, fontWeight: '600', marginBottom: 2 },
  redeemValue:   { fontSize: 22, fontWeight: '700', color: GOLD },
  bonusBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  bonusText:     { fontSize: 11, color: '#2E7D32', fontWeight: '600' },
  branchRow:     { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  branchText:    { fontSize: 12, color: '#aaa' },
});

// ── Coupon styles ─────────────────────────────────────────
const coupon = StyleSheet.create({
  wrapper:   { borderWidth: 1.5, borderColor: GOLD_LIGHT, borderStyle: 'dashed', borderRadius: 10, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FDFAF3' },
  label:     { fontSize: 10, color: '#999', fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  code:      { fontSize: 22, fontWeight: '700', color: GOLD, letterSpacing: 2 },
  sub:       { fontSize: 11, color: '#888', marginTop: 3 },
  btn:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: GOLD, backgroundColor: '#fff' },
  btnCopied: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  btnText:   { fontSize: 13, fontWeight: '700', color: GOLD },
});