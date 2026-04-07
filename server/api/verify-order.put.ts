export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  
  try {
    type VerifyOrderRequest = {
      OrderId: number,
      MerchantId: number,
      ScId: number,
      SessionId: string
    }

    const body = await readBody<VerifyOrderRequest>(event);

    type VerifyOrderResponse = {
      order_id: number,
      merchant_id: number,
      order_status: number,
      customer_plate: string,
      eta: string,
      order_time: string,
      sc_id: number
    }

    // Updated to use the new gateway and apiKey
    const verifyOrderResponse = await $fetch<VerifyOrderResponse>("http://40.83.77.78:8000/api/verify", {
      method: 'PUT',
      headers: {
        'apikey': config.submitVerifyOrderApiKey
      },
      body: {
        StripeSessionId: body.SessionId,
        OrderId: body.OrderId,
        MerchantId: body.MerchantId,
        ScId: body.ScId
      }
    });

    return verifyOrderResponse;

  } catch (error: any) {
    console.error('Verify Order API Error:', error.data || error.message)
    
    throw createError({ 
      statusCode: error.response?.status || 500, 
      statusMessage: error.data?.message || 'Verify Order Failed' 
    })
  }
})