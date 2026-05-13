// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { CartProvider, useCart } from './src/context/CartContext';
import { WishlistProvider, useWishlist } from './src/context/WishlistContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';

import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import OTPScreen from './src/screens/OTPScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SchemesScreen from './src/screens/SchemesScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: '#8B6914' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' },
};

function WishlistTabIcon({ color }) {
  const { wishlist } = useWishlist();
  return (
    <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="heart-outline" size={24} color={color} />
      {wishlist.length > 0 && (
        <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: '#c0392b', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{wishlist.length}</Text>
        </View>
      )}
    </View>
  );
}

function CartTabIcon({ color }) {
  const { count } = useCart();
  return (
    <View style={{ width: 26, height: 26, alignItems: 'center', justifyContent: 'center' }}>
      <Ionicons name="bag-outline" size={24} color={color} />
      {count > 0 && (
        <View style={{ position: 'absolute', top: -4, right: -8, backgroundColor: '#c0392b', borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
          <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function ProfileTabIcon({ color }) {
  const { user } = useAuth();
  return <Ionicons name={user ? 'person' : 'person-outline'} size={24} color={color} />;
}

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Product" component={ProductScreen}
        options={({ route }) => ({ headerShown: true, title: route.params?.title || 'Product', ...headerStyle })} />
      <Stack.Screen name="Category" component={CategoryScreen}
        options={({ route }) => ({ headerShown: true, title: route.params?.title || 'Category', ...headerStyle })} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Login" component={LoginScreen}
        options={{ headerShown: true, title: 'Login', ...headerStyle }} />
      <Stack.Screen name="OTP" component={OTPScreen}
        options={{ headerShown: true, title: 'Verify OTP', ...headerStyle }} />
      <Stack.Screen name="Register" component={RegisterScreen}
        options={{ headerShown: true, title: 'Create Account', ...headerStyle }} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <NavigationContainer>
              <Tab.Navigator
                screenOptions={{
                  headerShown: false,
                  tabBarActiveTintColor: '#8B6914',
                  tabBarInactiveTintColor: '#999',
                  tabBarStyle: { elevation: 8, height: 58, paddingBottom: 6 },
                }}
              >
                <Tab.Screen name="ShopTab" component={ShopStack}
                  options={{ tabBarLabel: 'Shop', tabBarIcon: ({ color }) => <Ionicons name="storefront-outline" size={24} color={color} /> }} />
                <Tab.Screen name="WishlistTab" component={WishlistScreen}
                  options={{ tabBarLabel: 'Wishlist', tabBarIcon: WishlistTabIcon, headerShown: true, title: 'My Wishlist', ...headerStyle }} />
                <Tab.Screen name="CartTab" component={CartScreen}
                  options={{ tabBarLabel: 'Cart', tabBarIcon: CartTabIcon, headerShown: true, title: 'My Cart', ...headerStyle }} />
                <Tab.Screen name="SchemesTab" component={SchemesScreen}
                  options={{ tabBarLabel: 'Schemes', tabBarIcon: ({ color }) => <Ionicons name="diamond-outline" size={24} color={color} />, headerShown: true, title: 'My Schemes', ...headerStyle }} />
                <Tab.Screen name="ProfileTab" component={ProfileStack}
                  options={{ tabBarLabel: 'Profile', tabBarIcon: ProfileTabIcon, headerShown: false, title: 'My Profile', ...headerStyle }} />
              </Tab.Navigator>
            </NavigationContainer>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}