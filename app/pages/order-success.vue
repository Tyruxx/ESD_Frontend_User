<script lang="ts" setup>
// if (import.meta.client) {
//   const session = sessionStorage.getItem('user_session')
//   if (!session) {
//     navigateTo('/login')
//   }
// }

    const orderId = Number(useRoute().query.OrderId)
    const merchantId = Number(useRoute().query.MerchantId)
    const scId = Number(useRoute().query.ScId)
    const sessionId = useRoute().query.SessionId

    type VerifyOrderResponse = {
        order_id: number,
        merchant_id: number,
        order_status: number,
        customer_plate: string,
        eta: string,
        order_time: string,
        sc_id: number
    }

    const { data: verifyOrderResponse, error } = useFetch<VerifyOrderResponse>('/api/verify-order', {
        method: 'PUT',
        body: {
            SessionId: sessionId,
            OrderId: orderId,
            MerchantId: merchantId,
            ScId: scId
        }
    })
    if (error.value != undefined) {
        console.log("Verify Order Failed")
    }

    import {
        Empty,
        EmptyContent,
        EmptyDescription,
        EmptyHeader,
        EmptyMedia,
        EmptyTitle,
    } from '@/components/ui/empty'

// "http://localhost:3000/order-success?" + "OrderId=" + LongIntegerToText(CreateOrder.Response.data.order_id) + "?MerchantId=" + LongIntegerToText(CreateOrder.Response.data.merchant_id) + "?ScId=" + LongIntegerToText(CreateOrder.Response.data.sc_id) + "&SessionId={CHECKOUT_SESSION_ID}"
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

<template class="px-8 py-8 flex mx-auto flex-col min-h-screen gap-4 w-sm">
  <Empty class="gap-2">
    <EmptyTitle>Order #{{ verifyOrderResponse?.order_id }} has been successfully placed.</EmptyTitle>
    <EmptyDescription>Please go to Order page for further details</EmptyDescription>
    <EmptyContent>
       <NuxtLink to="/order"><Button>Go to Order</Button></NuxtLink>
    </EmptyContent>
  </Empty>
</template>