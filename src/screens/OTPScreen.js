// src/screens/OTPScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

 

export default function OTPScreen({ route, navigation }) {
  const { phone } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);
  const { verifyOTP, sendOTP, login } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleOtpChange(val, idx) {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
    if (!val && idx > 0) inputs.current[idx - 1]?.focus();
  }

  async function handleVerify() {
    const code = otp.join('');
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const result = await verifyOTP(phone, code);
      if (!result.success) {
        Alert.alert('Invalid OTP', result.message);
        return;
      }
      if (result.needsRegistration) {
        navigation.navigate('Register', { phone });
        return;
      }
      login({ ...result.customer, token: result.token, gmsToken: result.gmsToken, gmsUser: result.gmsUser });
      navigation.reset({ index: 0, routes: [{ name: 'ProfileTab' }] });
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await sendOTP(phone);
      setTimer(60);
      Alert.alert('OTP Sent', 'A new OTP has been sent to your number');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Verify OTP</Text>
      <Text style={styles.sub}>Enter the 6-digit OTP sent to +91 {phone}</Text>

      <View style={styles.otpRow}>
        {otp.map((digit, idx) => (
          <TextInput
            key={idx}
            ref={r => inputs.current[idx] = r}
            style={[styles.otpBox, digit && styles.otpBoxFilled]}
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={val => handleOtpChange(val, idx)}
            textAlign="center"
            autoFocus={idx === 0}
          />
        ))}
      </View>

      <TouchableOpacity
        style={[styles.btn, (loading || otp.join('').length !== 6) && styles.btnDisabled]}
        onPress={handleVerify}
        disabled={loading || otp.join('').length !== 6}
      >
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.btnText}>Verify & Continue</Text>
        }
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => { if (timer === 0) handleResend(); }}
        disabled={timer > 0 || resending}
        style={styles.resendBtn}
      >
        <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
          {resending ? 'Sending...' : timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeBtn}>
        <Text style={styles.changeText}>← Change number</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, justifyContent: 'center' },
  heading: { fontSize: 26, fontWeight: '700', color: '#1a1a1a', marginBottom: 8 },
  sub: { fontSize: 14, color: '#666', marginBottom: 32 },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  otpBox: {
    width: 48, height: 56, borderWidth: 2, borderColor: '#ddd',
    borderRadius: 10, fontSize: 22, fontWeight: '700', color: '#1a1a1a',
    backgroundColor: '#f5f5f5',
  },
  otpBoxFilled: { borderColor: '#8B6914', backgroundColor: '#fef9f0' },
  btn: {
    backgroundColor: '#8B6914', padding: 16,
    borderRadius: 10, alignItems: 'center', marginBottom: 16,
  },
  btnDisabled: { backgroundColor: '#ccc' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resendBtn: { alignItems: 'center', marginBottom: 16, padding: 8 },
  resendText: { color: '#8B6914', fontSize: 14, fontWeight: '600' },
  resendDisabled: { color: '#999' },
  changeBtn: { alignItems: 'center' },
  changeText: { color: '#666', fontSize: 14 },
});