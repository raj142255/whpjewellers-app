// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ route, navigation }) {
  const { phone } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { registerUser, login } = useAuth();

  async function handleRegister() {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    setLoading(true);
    try {
      const result = await registerUser(phone, name.trim(), email.trim());
      if (!result.success) {
        Alert.alert('Error', result.message);
        return;
      }
      login({ ...result.customer, token: result.token });
      navigation.reset({ index: 0, routes: [{ name: 'ProfileTab' }] });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.heading}>Complete Registration</Text>
        <Text style={styles.sub}>Welcome! Please enter your details to continue</Text>
        <Text style={styles.phoneLabel}>Mobile: +91 {phone}</Text>

        <Text style={styles.label}>Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          autoFocus
        />

        <Text style={styles.label}>Email (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TouchableOpacity
          style={[styles.btn, (loading || !name.trim()) && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={loading || !name.trim()}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Create Account</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 24, paddingTop: 40 },
  heading: { fontSize: 24, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  sub: { fontSize: 14, color: '#666', marginBottom: 8 },
  phoneLabel: { fontSize: 14, color: '#8B6914', fontWeight: '600', marginBottom: 28 },
  label: { fontSize: 13, color: '#444', fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    paddingHorizontal: 14, height: 50, fontSize: 16,
    backgroundColor: '#f5f5f5', marginBottom: 20,
  },
  btn: {
    backgroundColor: '#8B6914', padding: 16,
    borderRadius: 10, alignItems: 'center', marginTop: 8,
  },
  btnDisabled: { backgroundColor: '#ccc' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});