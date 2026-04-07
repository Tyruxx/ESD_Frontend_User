<script lang="ts" setup>
// if (import.meta.client) {
//   const session = sessionStorage.getItem('user_session')
//   if (!session) {
//     navigateTo('/login')
//   }
// }

    import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    } from '@/components/ui/card'
    import {
    Item,
    ItemActions,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
    } from '@/components/ui/item'
    import { Input } from '@/components/ui/input'
    import { MinusIcon, PlusIcon, ChevronLeft } from 'lucide-vue-next'
    import { toast } from 'vue-sonner'


    type Item = {
      item_id: number,
      merchant_id: number,
      item_name: string,
      item_qty: number,
      item_price: number,
      is_on_sale: boolean
    }

    type Merchant = {
        data: {
            merchant_id: number,
            sc_id: number,
            merchant_name: string,
            opening_time: string,
            closing_time: string,
            contact_number: string,
            email: string
        }
    }
    
    type OrderItem = {
    item_id: number;
    item_qty: number;
    };

    type SubmitOrderRequest = {
        merchant_id: number,
        customer_plate: string,
        customer_id: number,
        payment_method: string,
        item_list: OrderItem[],
        eta: string,
        // We add these for UI display purposes only
        merchant_name?: string,
        opening_time?: string,
        closing_time?: string,
        items_full_data: Item[],
        sc_id: number
    };

    type Cart = SubmitOrderRequest[];

    const plate_numbers = ref<Record<number, string>>({})
    const selected_times = ref<Record<number, string>>({});
    const OPEN_HOUR = 9;
    const CLOSE_HOUR = 21;

    const cartState = await useState<Cart | undefined>('cartState');

    watch(cartState, (newCart) => {
        if (import.meta.client) {
            sessionStorage.setItem('user_cart', JSON.stringify(newCart));
        }
    }, { deep: true });

    onMounted(() => {
    if (import.meta.client) {
        const savedCart = sessionStorage.getItem('user_cart');
        if (savedCart) {
            cartState.value = JSON.parse(savedCart);
        }
    }
    });

    function updateQuantity(type: string, merchant_id: number, item_id: number) {
        const order = cartState.value?.find(o => o.merchant_id === merchant_id);
        if (!order) return;

        const itemRef = order.item_list.find(i => i.item_id === item_id);
        const fullData = order.items_full_data.find(i => i.item_id === item_id);

        if (itemRef && fullData) {
            if (type === "minus") {
                if (itemRef.item_qty > 1) {
                    itemRef.item_qty--;
                    fullData.item_qty--;
                } else {
                    // Remove item when quantity reaches 0
                    order.item_list = order.item_list.filter(i => i.item_id !== item_id);
                    order.items_full_data = order.items_full_data.filter(i => i.item_id !== item_id);

                    // Remove the merchant order entirely if no items remain
                    if (order.item_list.length === 0) {
                        cartState.value = cartState.value?.filter(o => o.merchant_id !== merchant_id);
                    }
                }
            } else {
                itemRef.item_qty++;
                fullData.item_qty++;
            }
        }
    }

    async function validateAndSubmit(order: SubmitOrderRequest) {
        const plate = plate_numbers.value[order.merchant_id]?.trim();
        const time = selected_times.value[order.merchant_id];

        if (!plate) {
            toast.error("Plate Number Required", {
                description: "Please enter a valid vehicle plate number."
            });
            return;
        }
        
        if (!time) {
            toast.error("Arrival Time Required", {
                description: "Please select when you plan to arrive."
            });
            return;
        }

        const arrivalDate = new Date(time);
        const hour = arrivalDate.getHours();
        const openingHour = parseInt(order.opening_time?.split(':')[0] || '-1');
        const closingHour = parseInt(order.closing_time?.split(':')[0] || '-1');

        if (arrivalDate < new Date()) {
            toast.error("Invalid Time", {
                description: "Arrival time cannot be in the past."
            });
            return;
        }

        if (openingHour != -1 && closingHour != -1) {
            if (hour < openingHour || hour >= closingHour) {
                toast.warning("Merchant Closed", {
                    description: `Please select a time between ${openingHour}:00 and ${closingHour}:00.`
                });
                return;
            }
            await submitOrder(order);
        } else {
            toast.error("Merchant Hours Unavailable", {
                description: "Unable to retrieve merchant hours. Please try again later."
            });
        }
    }

    async function submitOrder(order: SubmitOrderRequest) {
        try {
            const response = await $fetch('/api/submit-order', {
                method: 'POST',
                body: {
                    merchant_id: order.merchant_id,
                    customer_plate: plate_numbers.value[order.merchant_id],
                    customer_id: 1,
                    payment_method: "STRIPE",
                    item_list: order.item_list, // Match the API field name
                    eta: selected_times.value[order.merchant_id],
                    sc_id: order.sc_id,
                }
            })
            cartState.value = cartState.value?.filter(c => c.merchant_id !== order.merchant_id);
            window.location.href = response.payment_url
        } catch (e) {
            toast.error("Submission Failed", {
                description: "There was an error processing your order. Please try again."
            });
        }
    }

    function goToHome() {
        navigateTo('/');
    }

    async function getMerchantName(merchantId: number, scId: number) {
        const { data } = await useFetch<Merchant>(`/api/merchant-by-sc_id-by-merchant_id?sc_id=${scId}merchant_id=${merchantId}`)
        return data.value?.data.merchant_name
    }

</script>

<template>
  <div class="px-8 py-8 flex mx-auto flex-col min-h-screen gap-4 w-sm">
        <div>
            <Button @click="goToHome()">
                <ChevronLeft />
            </Button>
        </div>
        <div class="w-fit text-5xl font-semibold">
            Cart
        </div>
        <div class="w-fit text-base">
            Review your items before submitting.
        </div>
            <Item
                variant="outline"
                class="cursor-pointer flex flex-col items-start"
                v-for="cart of cartState"
            >
                <div class="flex flex-row gap-3">
                    <div>
                        <Avatar>
                        <AvatarImage src="https://github.com/evilrabbit.png" />
                        <AvatarFallback>SC</AvatarFallback>
                        </Avatar>
                    </div>
                    <ItemTitle class="text-base">{{ cart.merchant_name }}</ItemTitle>
                </div>
                <div class="flex flex-row w-full justify-between items-center" v-for="item of cart.items_full_data">
                    <div class="w-full">
                        <ItemTitle>{{ item.item_name }}</ItemTitle>
                        <ItemDescription>${{ item.item_price }} each</ItemDescription>
                    </div>
                    <div class="font-semibold flex flex-col items-end gap-1">
                        <div>${{ (item.item_qty * item.item_price).toFixed(2) }}</div>
                        <ButtonGroup class="flex flex-row">
                            <Button variant="outline" @click="updateQuantity(`minus`, item.merchant_id, item.item_id)"><MinusIcon /></Button>
                            <Button disabled variant="outline">{{ item.item_qty }}</Button>
                            <Button variant="outline" @click="updateQuantity(`plus`, item.merchant_id, item.item_id)"><PlusIcon /></Button>
                        </ButtonGroup>
                    </div>
                </div>
                <div class="flex flex-col gap-3 w-full justify-between items-end">
                    <div class="flex flex-col gap-2 w-full">
                        <div class="flex flex-col w-full">
                            <label>ETA</label>
                            <Input 
                                v-model="selected_times[cart.merchant_id]" 
                                type="datetime-local" 
                            />
                        </div>
                        <div class="flex flex-col w-full">
                            <label>Plate Number</label>
                            <Input v-model="plate_numbers[cart.merchant_id]" type="text" placeholder="Enter plate number..." />
                        </div>
                    </div>
                    <Button type="submit" @click="validateAndSubmit(cart)" class="mb-2">
                        Submit
                    </Button>
                </div>
            </Item>
  </div>
</template>