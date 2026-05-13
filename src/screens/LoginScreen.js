// src/screens/LoginScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const LOGO_URL = 'https://cdn.shopify.com/s/files/1/0714/0419/1917/files/WHP_LOGO_9_10_25_2_brand_color_1.png?v=1765269037';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { sendOTP } = useAuth();

  async function handleSendOTP() {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await sendOTP(`91${phone}`);
      navigation.navigate('OTP', { phone });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.inner}>
        <Image source={{ uri: LOGO_URL }} style={styles.logo} resizeMode="contain" />
        <Text style={styles.heading}>Login / Register</Text>
        <Text style={styles.subheading}>Enter your mobile number to continue</Text>

        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="10-digit mobile number"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={t => { setPhone(t); setError(''); }}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={[styles.btn, (loading || phone.length !== 10) && styles.btnDisabled]}
          onPress={handleSendOTP}
          disabled={loading || phone.length !== 10}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Send OTP</Text>
          }
        </TouchableOpacity>

        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  logo: { width: 160, height: 55, alignSelf: 'center', marginBottom: 32 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  subheading: { fontSize: 14, color: '#666', marginBottom: 28 },
  phoneRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  countryCode: {
    backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 12,
    justifyContent: 'center', borderWidth: 1, borderColor: '#ddd',
  },
  countryCodeText: { fontSize: 15, color: '#222' },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    paddingHorizontal: 14, height: 50, fontSize: 16, backgroundColor: '#f5f5f5',
  },
  error: { color: '#c00', fontSize: 13, marginBottom: 8 },
  btn: {
    backgroundColor: '#8B6914', padding: 16,
    borderRadius: 10, alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#ccc' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  terms: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 24, lineHeight: 18 },
});