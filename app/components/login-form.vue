<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { GalleryVerticalEnd, Info } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  class?: string
}>()

const customerId = ref('')
const password = ref('')

/**
 * FIXED: Initialize useState with a factory function.
 * This checks sessionStorage immediately on the client side.
 */
const userSession = useState<string>('user_session', () => {
  if (import.meta.client) {
    return sessionStorage.getItem('customer_id') || ''
  }
  return ''
})

// --- ACTIONS ---
function setUserSession() {
  const id = customerId.value.trim()
  const pass = password.value.trim()
  
  if (id !== '1' || pass !== '1') {
    toast.error('Invalid Credentials', {
      description: 'Use ID: 1, Pass: 1 for demo.'
    })
    return
  }

  // 1. Update the reactive state
  userSession.value = id

  // 2. Persist to storage IMMEDIATELY before navigating
  if (import.meta.client) {
    sessionStorage.setItem('customer_id', id)
  }

  toast.success('Login successful!')
  return navigateTo('/')
}

function useDemo() {
  customerId.value = '1'
  password.value = '1'
}

/**
 * FIXED: Reliability check. 
 * If the user refreshes on a DIFFERENT page and navigates back here,
 * we ensure the local refs and state stay synced.
 */
onMounted(() => {
  const savedId = sessionStorage.getItem('customer_id')
  if (savedId) {
    userSession.value = savedId
  }
})
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <form @submit.prevent="setUserSession">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GalleryVerticalEnd class="size-6" />
          </div>
          <h1 class="text-xl font-bold">Welcome back</h1>
          <p class="text-sm text-muted-foreground">Enter your Customer ID to start shopping.</p>
        </div>

        <div class="grid gap-2">
          <label for="customerId" class="text-sm font-medium">Customer ID</label>
          <Input id="customerId" v-model="customerId" placeholder="1" required />
        </div>

        <div class="grid gap-2">
          <label for="password" class="text-sm font-medium">Password</label>
          <Input id="password" type="password" v-model="password" placeholder="1" required />
        </div>

        <div @click="useDemo" class="flex items-center gap-3 p-3 rounded-lg border border-dashed bg-muted/30 cursor-pointer hover:bg-muted/50">
          <Info class="size-4 text-primary" />
          <span class="text-xs">Click to use demo credentials (1/1)</span>
        </div>

        <Button type="submit" class="w-full" :disabled="!customerId">
          Login
        </Button>
      </div>
    </form>
  </div>
</template>