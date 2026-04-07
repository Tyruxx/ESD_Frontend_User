<script lang="ts" setup>

import Merchants from '~/components/merchants.vue'

  type ShoppingCenter = {
          sc_name: string,
          sc_id: number,
          sc_address: string,
          sc_loading_slots: string
  }

  type Merchant = {
      merchant_id: number,
      sc_id: number,
      merchant_name: string
  }

  type Item = {
      item_id: number,
      merchant_id: number,
      item_name: string,
      item_qty: number,
      item_price: number,
      is_on_sale: boolean
  }
  type Cart = Record<string,Item>;

  // --- 2. STATE INITIALIZATION ---
  // We add a factory function to check sessionStorage immediately on the client
  const userSession = useState<string>('user_session', () => {
    // This runs immediately when the state is first accessed
    if (import.meta.client) {
      return sessionStorage.getItem('customer_id') || ''
    }
    return ''
  })
  const shoppingCenterState = useState<ShoppingCenter | undefined>('shoppingCenterState', undefined);
  const merchantState = useState<Merchant | undefined>('merchantState', undefined);
  const itemState = useState<Item | undefined>('itemState', undefined);
  const cartState = useState<Cart | undefined>('cartState', undefined);

  // --- 3. AUTH GUARD ---
  // This runs on the client side to redirect if no session is found
  watch(userSession, (val) => {
    // If we are on the client and the session is still empty after initialization
    if (import.meta.client && !val) {
      navigateTo('/login')
    }
  }, { immediate: true })
  
</script>
<template>
  <div class="px-8 py-8 flex mx-auto flex-col min-h-screen gap-4 w-sm">
    <ShoppingCenters v-if="shoppingCenterState == undefined && merchantState == undefined && itemState == undefined" />
    <Merchants v-if="shoppingCenterState != undefined && merchantState == undefined && itemState == undefined" />
    <Items v-if="shoppingCenterState != undefined && merchantState != undefined && itemState == undefined" />
    <DataItem v-if="shoppingCenterState != undefined && merchantState != undefined && itemState != undefined" />
  </div>
</template>
