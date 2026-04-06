<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import type { HTMLAttributes } from "vue"
import { GalleryVerticalEnd, Info } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import { toast } from 'vue-sonner'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const customerId = ref('')
const userSession = useState<string>('user_session', () => '')

// --- 1. PERSISTENCE LOGIC ---
// Syncs customer session with sessionStorage to prevent logout on refresh
watch(userSession, (newVal) => {
  if (import.meta.client) {
    if (newVal) {
      sessionStorage.setItem('customer_id', newVal)
    } else {
      sessionStorage.removeItem('customer_id')
    }
  }
})

onMounted(() => {
  if (import.meta.client) {
    const savedId = sessionStorage.getItem('customer_id')
    if (savedId && !userSession.value) {
      userSession.value = savedId
    }
  }
})

// --- 2. ACTIONS ---
function setUserSession() {
  const id = customerId.value.trim()
  
  // Restriction for Demo purposes
  if (id !== '1') {
    toast.error('Invalid Customer ID', {
      description: 'Please use the demo ID "1" to login.'
    })
    return
  }

  if (id) {
    userSession.value = id
    navigateTo('/')
  }
}

// Quick-fill helper
function useDemo() {
  customerId.value = '1'
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <form @submit.prevent="setUserSession()">
      <FieldGroup>
        <div class="flex flex-col items-center gap-2 text-center">
          <div class="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <GalleryVerticalEnd class="size-6" />
          </div>
          <h1 class="text-xl font-bold">Welcome back</h1>
          <FieldDescription>
            Enter your Customer ID to start shopping.
          </FieldDescription>
        </div>

        <Field>
          <FieldLabel for="customerId">Customer ID</FieldLabel>
          <Input
            id="customerId"
            type="text" 
            placeholder="e.g. 1"
            v-model="customerId"
            required
            class="h-11"
          />
        </Field>

        <div 
          @click="useDemo"
          class="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors border-dashed group"
        >
          <div class="bg-primary/20 p-1.5 rounded-md group-hover:bg-primary/30 transition-colors">
            <Info class="size-4 text-primary" />
          </div>
          <div class="flex flex-col">
            <span class="text-[11px] font-bold uppercase tracking-wider opacity-70">Demo Account</span>
            <span class="text-xs font-medium">Use Customer ID: <span class="font-bold text-primary">1</span></span>
          </div>
        </div>

        <Field>
          <Button 
            type="submit" 
            class="w-full h-11 font-bold"
            :disabled="customerId.trim() === ''"
          >
            Login
          </Button>
        </Field>
      </FieldGroup>
    </form>

    <FieldDescription class="px-6 text-center text-[11px]">
      Don't have an account? <a href="#" class="font-bold text-primary hover:underline">Sign up</a>
    </FieldDescription>
  </div>
</template>