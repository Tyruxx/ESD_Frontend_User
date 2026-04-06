<script lang="ts" setup>
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { ChevronLeft } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { ref, watch, onMounted } from 'vue'
import { toast } from 'vue-sonner'

// --- 1. TYPE DEFINITIONS ---
type Item = {
  item_id: number,
  merchant_id: number,
  item_name: string,
  item_qty: number,
  item_price: number,
  is_on_sale: boolean
}

type OrderItem = {
  item_id: number,
  item_qty: number
};

type SubmitOrderRequest = {
  merchant_id: number,
  customer_plate: string,
  customer_id: string,
  payment_method: string,
  item_list: OrderItem[],
  eta: string,
  merchant_name?: string,
  opening_time?: string,
  closing_time?: string,
  items_full_data: Item[],
  sc_id: number
};

type Cart = SubmitOrderRequest[];

type ShoppingCenter = {
  sc_name: string,
  sc_id: number,
  sc_address: string,
  sc_loading_slots: string
}

type Merchant = {
  merchant_id: number,
  sc_id: number,
  merchant_name: string,
  opening_time: string,
  closing_time: string,
}

// --- 2. GLOBAL STATE ---
const merchantState = await useState<Merchant | undefined>('merchantState');
const shoppingCenterState = await useState<ShoppingCenter | undefined>('shoppingCenterState');
const itemState = await useState<Item | undefined>('itemState');
const cartState = await useState<Cart | undefined>('cartState', () => []);

// --- 3. SESSION PERSISTENCE ---
watch(cartState, (newCart) => {
  if (import.meta.client) {
    if (!newCart) {
      sessionStorage.removeItem('user_cart');
    } else {
      sessionStorage.setItem('user_cart', JSON.stringify(newCart));
    }
  }
}, { deep: true });

onMounted(() => {
  if (import.meta.client) {
    const savedCart = sessionStorage.getItem('user_cart');
    if (savedCart && savedCart !== 'undefined' && savedCart !== 'null') {
      const parsed = JSON.parse(savedCart);
      // Only hydrate if the current state is empty to avoid overwriting newer changes
      if (!cartState.value || cartState.value.length === 0) {
        cartState.value = parsed;
      }
    }
  }
});

// --- 4. ACTIONS ---
function revertItemState() {
  itemState.value = undefined;
}

function updateIntoCart() {
  const item = itemState.value;
  if (!item) return;

  // Initialize cart if it doesn't exist
  if (!cartState.value) cartState.value = [];

  // Find the existing order for this specific merchant
  let merchantOrder = cartState.value.find(order => order.merchant_id === item.merchant_id);

  if (!merchantOrder) {
    // Create a new merchant entry if this is the first item from them
    merchantOrder = {
      merchant_id: item.merchant_id,
      sc_id: shoppingCenterState.value?.sc_id ?? 0,
      customer_plate: "", 
      customer_id: "",    
      payment_method: "STRIPE", 
      eta: new Date().toISOString(),
      item_list: [],
      items_full_data: [],
      merchant_name: merchantState.value?.merchant_name,
      opening_time: merchantState.value?.opening_time,
      closing_time: merchantState.value?.closing_time,
    };
    cartState.value.push(merchantOrder);
  }

  // Check if this specific item is already in that merchant's list
  const existingItemIdx = merchantOrder.item_list.findIndex(i => i.item_id === item.item_id);

  if (existingItemIdx > -1 && merchantOrder.item_list[existingItemIdx] != undefined) {
    // Logic: Increment by 1 on every click
    const currentQty = merchantOrder.item_list[existingItemIdx].item_qty;
    const maxQty = item.item_qty ?? 999;

    if (currentQty < maxQty && merchantOrder.items_full_data[existingItemIdx] != undefined) {
      merchantOrder.item_list[existingItemIdx].item_qty++;
      merchantOrder.items_full_data[existingItemIdx].item_qty++;
      toast.success(`Increased quantity of ${item.item_name} to ${merchantOrder.item_list[existingItemIdx].item_qty}.`);
    } else {
      toast.error(`Cannot add more than ${maxQty} of this item.`);
    }
  } else {
    // Logic: First time adding this item, set quantity to 1
    merchantOrder.item_list.unshift({ item_id: item.item_id, item_qty: 1 });
    merchantOrder.items_full_data.unshift({ ...item, item_qty: 1 });
  }
}
</script>

<template>
    <div>
        <Button @click="revertItemState()">
            <ChevronLeft />
        </Button>
    </div>
    <div class="flex flex-1 flex-col gap-6 max-w-lg min-w-xs">
        <AspectRatio :ratio="16 / 9" class="bg-muted rounded-lg">
            <img
                src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                alt="Photo by Drew Beamer"
                fill
                class="h-full w-full rounded-lg object-cover dark:brightness-[0.2] dark:grayscale"
            >
        </AspectRatio>
        <div class="flex flex-col gap-2">
            <div class="w-fit text-3xl font-base">
                {{ itemState?.item_name }}
            </div>
            <div>
                There are {{ itemState?.item_qty }} pieces left.
            </div>
        </div>
        <div class="flex flex-col gap-2">
            <div class="w-fit text-5xl font-semibold">
                ${{ itemState?.item_price }}
            </div>
        </div>
        <Button @click="updateIntoCart()">Add to cart</Button>
    </div>
</template>