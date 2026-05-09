# WHP Jewellers Mobile App

React Native (Expo) app connected to your Shopify store.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Fill in your .env file
Open `.env` and add your real Client Secret:
```
EXPO_PUBLIC_SHOPIFY_SHOP=jewellery-123456924
EXPO_PUBLIC_SHOPIFY_CLIENT_ID=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
SHOPIFY_CLIENT_SECRET=YOUR_REAL_SECRET_HERE
```

### 3. Run the app
```bash
# Start Expo
npx expo start

# Then press:
# a → Android emulator
# i → iOS simulator
# Scan QR → your phone (install Expo Go app first)
```

## Screens
- **Home** — product grid, pull to refresh
- **Product** — images, variant selector, add to cart
- **Cart** — quantity controls, remove items, total
- **Checkout** — opens Shopify hosted checkout in browser

## File structure
```
App.js                        # Navigation + providers
src/
  api.js                      # Shopify auth + GraphQL queries
  context/CartContext.js      # Cart state
  screens/
    HomeScreen.js             # Product grid
    ProductScreen.js          # Product detail
    CartScreen.js             # Cart + checkout
```

## To publish
1. `npx expo build:android` → .apk for Google Play
2. `npx expo build:ios` → .ipa for App Store
(Requires Expo account + Apple/Google developer accounts)
