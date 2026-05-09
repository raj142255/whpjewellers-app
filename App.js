// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';

import { CartProvider, useCart } from './src/context/CartContext';
import { WishlistProvider, useWishlist } from './src/context/WishlistContext';
import HomeScreen from './src/screens/HomeScreen';
import ProductScreen from './src/screens/ProductScreen';
import CartScreen from './src/screens/CartScreen';
import WishlistScreen from './src/screens/WishlistScreen';
import CategoryScreen from './src/screens/CategoryScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const headerStyle = {
  headerStyle: { backgroundColor: '#8B6914' },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' },
};

function TabBarIconWithBadge({ emoji, count }) {
  return (
    <View style={styles.tabIconWrap}>
      <Text style={styles.tabEmoji}>{emoji}</Text>
      {count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count > 99 ? '99+' : count}</Text>
        </View>
      )}
    </View>
  );
}

function WishlistTabIcon({ focused }) {
  const { wishlist } = useWishlist();
  return <TabBarIconWithBadge emoji="♡" count={wishlist.length} />;
}

function CartTabIcon({ focused }) {
  const { count } = useCart();
  return <TabBarIconWithBadge emoji="🛍️" count={count} />;
}

function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.title || 'Product',
          ...headerStyle,
        })}
      />
      <Stack.Screen
        name="Category"
        component={CategoryScreen}
        options={({ route }) => ({
          headerShown: true,
          title: route.params?.title || 'Category',
          ...headerStyle,
        })}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
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
              <Tab.Screen
                name="ShopTab"
                component={ShopStack}
                options={{
                  tabBarLabel: 'Shop',
                  tabBarIcon: () => <TabBarIconWithBadge emoji="💎" count={0} />,
                }}
              />
              <Tab.Screen
                name="WishlistTab"
                component={WishlistScreen}
                options={{
                  tabBarLabel: 'Wishlist',
                  tabBarIcon: WishlistTabIcon,
                  headerShown: true,
                  title: 'My Wishlist',
                  ...headerStyle,
                }}
              />
              <Tab.Screen
                name="CartTab"
                component={CartScreen}
                options={{
                  tabBarLabel: 'Cart',
                  tabBarIcon: CartTabIcon,
                  headerShown: true,
                  title: 'My Cart',
                  ...headerStyle,
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </WishlistProvider>
      </CartProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  tabIconWrap: { alignItems: 'center', justifyContent: 'center' },
  tabEmoji: { fontSize: 22 },
  tabBadge: {
    position: 'absolute', top: -4, right: -10,
    backgroundColor: '#c0392b', borderRadius: 9,
    minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 3,
  },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
});
