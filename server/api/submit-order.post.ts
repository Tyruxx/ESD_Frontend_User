import { config } from "node:process";

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event);
        const config = useRuntimeConfig(event);

        // Define the response type for better type safety
        type SubmitOrderResponse = {
            payment_url: string,
            order_id: number
        }

        // Map the incoming request body to the API payload
        const payload = {
            merchant_id: body.merchant_id,
            customer_plate: body.customer_plate,
            customer_id: body.customer_id,
            payment_method: body.payment_method,
            item_list: body.item_list, 
            eta: body.eta,
            sc_id: body.sc_id
        };

        // Execute the fetch to the new endpoint
        const response = await $fetch<SubmitOrderResponse>("http://40.83.77.78:8000/api/submit/SubmitOrder", {
            method: 'POST',
            headers: {
                'apiKey': config.submitVerifyOrderApiKey // Security header added here
            },
            body: payload
        });

        return response;

    } catch (error: any) {
        // Log the error for server-side debugging
        console.error('Submit Order Error:', error.data || error.message);

        throw createError({ 
            statusCode: error.statusCode || 500, 
            statusMessage: 'Submit Order Failed' 
        });
    }
});