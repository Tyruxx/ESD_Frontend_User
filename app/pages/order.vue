<script lang="ts" setup>
// if (import.meta.client) {
//   const session = sessionStorage.getItem('user_session')
//   if (!session) {
//     navigateTo('/login')
//   }
// }

import { Badge } from '@/components/ui/badge'
import { ChevronLeft, Clock, Package } from 'lucide-vue-next'
import {
  Item,
  ItemDescription,
  ItemTitle,
} from '@/components/ui/item'

// Status Mapping based on your requirements
const statusMap: Record<number, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  1: { label: 'CREATED (PAYMENT SUCCESSFUL)', variant: 'default' },
  2: { label: 'ARRIVED', variant: 'secondary' },
  3: { label: 'ARRIVED OUTSIDE OPERATION TIME', variant: 'outline' },
  4: { label: 'NO SHOW', variant: 'destructive' },
  5: { label: 'HANDED OVER', variant: 'default' },
  9: { label: 'PENDING PAYMENT', variant: 'outline' },
  10: { label: 'PAYMENT FAILED', variant: 'destructive' },
}

// Mock User ID
const customerId = await useState<string>('user_session')
const { data: orders } = useFetch(`/api/order-by-customer-id?customer_id=${customerId.value}`)

const sortedOrders = computed(() => {
  if (!orders.value?.data) return []
  return [...orders.value.data].sort((a, b) => new Date(b.order_time).getTime() - new Date(a.order_time).getTime())
})

// Item List and Conversion to Record
type Items = {
    item_id: number,
    merchant_id: number,
    item_name: string,
    item_qty: number,
    item_price: number,
    is_on_sale: boolean
}[]

const { data: items, refresh: refreshItems } = useFetch<Items>('/api/item-all')

const itemRecord = ref<Record<number, any>>({})

watch(items, (newItems) => {
  if (newItems) {
    itemRecord.value = newItems.reduce((acc: Record<number, any>, item: Items[number]) => {
      acc[item.item_id] = item;
      return acc;
    }, {});
  }
}, { immediate: true })

watch(orders, () => {
  refreshItems()
}, { immediate: false })

// Shopping Centers
type ShoppingCenters = {
    sc_name: string,
    sc_id: number,
    sc_address: string,
    sc_loading_slots: string
}[]

const { data: shoppingCenters } = useFetch<ShoppingCenters>('/api/shopping-center')

const scRecord = ref<Record<number, any>>({})

watch(shoppingCenters, (newSCs) => {
  if (newSCs) {
    scRecord.value = newSCs.reduce((acc: Record<number, any>, sc: ShoppingCenters[number]) => {
      acc[sc.sc_id] = sc;
      return acc;
    }, {});
  }
}, { immediate: true })

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString([], { 
    dateStyle: 'medium', 
    timeStyle: 'short' 
  })
}

function calculateTotal(items: any[]) {
  return items.reduce((acc, item) => acc + (item.item_qty * item.item_price), 0)
}

function goToHome() {
  navigateTo('/')
}

const userSession = useState<string>('user_session', () => {
if (import.meta.client) return sessionStorage.getItem('customer_id') || ''
return ''
})
onMounted(() => {
if (!userSession.value) {
  navigateTo('/login')
}
})
</script>

<template>
  <div class="px-8 py-8 flex mx-auto flex-col min-h-screen gap-4 w-sm">
    <!-- Sticky header -->
    <div class="fixed top-16 z-10 bg-background w-full">
      <div class="flex flex-col gap-4">
        <Button size="icon" @click="goToHome">
          <ChevronLeft class="w-4 h-4" />
        </Button>
        <div>
          <h1 class="text-3xl font-semibold">My Orders</h1>
          <p class="text-muted-foreground text-sm">Track your recent orders and status.</p>
        </div>
      </div>
      <div class="absolute bottom-0 left-0 right-0 h-20 translate-y-full bg-gradient-to-b from-background to-transparent pointer-events-none" />
    </div>

    <div class="flex flex-col gap-4 pt-28">
      <Item
        v-for="order in sortedOrders"
        :key="order.order_id"
        variant="outline"
        class="flex flex-col items-start p-4 gap-4"
      >
        <div class="flex justify-between w-full items-start">
          <div class="flex flex-col gap-2">
          <Badge :variant="statusMap[order.order_status]?.variant || 'outline'" v-if="order.order_status != undefined">
            {{ statusMap[order.order_status]?.label }}
          </Badge>
          <Badge variant="outline" v-else>
            UNKNOWN
          </Badge>
          <Badge variant="secondary">
            PLATE: {{ order.customer_plate || "N/A" }}
          </Badge>
            <div class="gap-1">
              <ItemTitle class="text-lg">Order #{{ order.order_id }} at {{ scRecord[order.sc_id]?.sc_name }}</ItemTitle>
              <ItemDescription>{{ scRecord[order.sc_id]?.sc_address }}</ItemDescription>
            </div>
          </div>
        </div>

        <Separator />

        <div class="w-full space-y-2">
          <div 
            v-for="item in order.order_items" 
            :key="item.item_id"
            class="flex justify-between text-sm"
          >
            <span class="flex gap-2">
              <span class="font-bold text-primary">{{ item.item_qty }}x</span>
              {{ itemRecord[item.item_id]?.item_name || 'Unknown Item' }}
            </span>
            <span class="font-medium">${{ (item.item_price * item.item_qty).toFixed(2) }}</span>
          </div>
        </div>

        <Separator />

        <div class="flex flex-col gap-3 w-full">
          <div class="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock class="w-3 h-3" />
            <span>ETA: {{ new Date(order.eta ?? "").toString() }}</span>
          </div>
          
          <div class="flex justify-between items-center w-full">
             <div class="text-xs text-muted-foreground">
               Ordered: {{ formatDate(order.order_time ?? "") }}
             </div>
             <div class="text-xs font-semibold">
               Total: ${{ calculateTotal(order.order_items ?? []).toFixed(2) }}
             </div>
          </div>
        </div>
      </Item>
    </div>

    <div v-if="sortedOrders.length === 0" class="flex flex-col items-center justify-center py-20 text-center">
      <Package class="w-12 h-12 text-muted-foreground mb-4" />
      <h3 class="text-lg font-medium">No orders yet</h3>
      <p class="text-sm text-muted-foreground">When you place an order, it will appear here.</p>
      <Button class="mt-4" @click="goToHome()">Start Shopping</Button>
    </div>
  </div>
</template>