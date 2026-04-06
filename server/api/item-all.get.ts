export default defineEventHandler(async (event) => {
    try {
        type Items = {
            item_id: number,
            merchant_id: number,
            item_name: string,
            item_qty: number,
            item_price: number,
            is_on_sale: boolean
        }[]
        const items = await $fetch<Items>("https://personal-0xujcjfg.outsystemscloud.com/inventory/rest/inventory/inventory");
        return items;
    } catch (error) {
        throw createError({ statusCode: 404, statusMessage: 'Not Found' })
    }
})