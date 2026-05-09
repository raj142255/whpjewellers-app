// src/api.js
const SHOP = process.env.EXPO_PUBLIC_SHOPIFY_SHOP;
const CLIENT_ID = process.env.EXPO_PUBLIC_SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_SHOPIFY_SECRET;

let cachedToken = null;
let tokenExpiresAt = 0;

async function getToken() {
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) return cachedToken;

  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
  });

  const res = await fetch(
    `https://${SHOP}.myshopify.com/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Auth failed: ${res.status} - ${errText}`);
  }

  const json = await res.json();
  cachedToken = json.access_token;
  tokenExpiresAt = Date.now() + (json.expires_in || 86400) * 1000;
  return cachedToken;
}

async function shopifyQuery(query, variables = {}) {
  const token = await getToken();
  const res = await fetch(
    `https://${SHOP}.myshopify.com/admin/api/2025-01/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': token,
      },
      body: JSON.stringify({ query, variables }),
    }
  );
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GraphQL failed: ${res.status} - ${errText}`);
  }
  const { data, errors } = await res.json();
  if (errors?.length) throw new Error(errors[0].message);
  return data;
}

export async function fetchProducts(cursor = null) {
  const data = await shopifyQuery(
    `query Products($cursor: String) {
      products(first: 20, after: $cursor) {
        pageInfo { hasNextPage endCursor }
        edges {
          node {
            id title handle
            priceRangeV2 { minVariantPrice { amount currencyCode } }
            featuredImage { url altText }
            variants(first: 1) { edges { node { id } } }
          }
        }
      }
    }`,
    { cursor }
  );
  return data.products;
}

export async function fetchProduct(id) {
  const data = await shopifyQuery(
    `query Product($id: ID!) {
      product(id: $id) {
        id title descriptionHtml
        priceRangeV2 { minVariantPrice { amount currencyCode } }
        images(first: 5) { edges { node { url altText } } }
       variants(first: 10) {
  edges { node { id title availableForSale price } }
}
      }
    }`,
    { id }
  );
  return data.product;
}
export async function createCheckout(lineItems) {
  const itemsGql = lineItems
    .map(i => `{ variantId: "${i.variantId}", quantity: ${i.quantity} }`)
    .join(', ');
  const data = await shopifyQuery(
    `mutation {
      draftOrderCreate(input: { lineItems: [${itemsGql}] }) {
        draftOrder { id invoiceUrl }
        userErrors { message }
      }
    }`
  );
  const { draftOrder, userErrors } = data.draftOrderCreate;
  if (userErrors?.length) throw new Error(userErrors[0].message);
  return { webUrl: draftOrder.invoiceUrl };
}

export async function fetchProductsByCollection(handle) {
  if (!handle) {
    const data = await fetchProducts();
    return data.edges.map(e => e.node);
  }
  const data = await shopifyQuery(
    `query Collection($handle: String!) {
      collectionByHandle(handle: $handle) {
        products(first: 40) {
          edges {
            node {
              id title handle
              priceRangeV2 { minVariantPrice { amount currencyCode } }
              featuredImage { url altText }
              variants(first: 1) { edges { node { id } } }
            }
          }
        }
      }
    }`,
    { handle }
  );
  const collection = data.collectionByHandle;
  if (!collection) throw new Error(`Collection "${handle}" not found`);
  return collection.products.edges.map(e => e.node);
}


export async function fetchMenu() {
  const query = `
    query {
      menu(id: "gid://shopify/Menu/242874941578") {
        items {
          id
          title
          url
          items {
            id
            title
            url
            items {
              id
              title
              url
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyQuery(query);
    return data?.menu?.items || [];
  } catch (error) {
    console.error("Shopify Menu Fetch Error:", error);
    return []; // This will trigger your FALLBACK in DrawerMenu.js
  }
}