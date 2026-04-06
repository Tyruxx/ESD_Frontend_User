<script setup lang="ts">
import { ref } from 'vue'
import type { HTMLAttributes } from "vue"

import { GalleryVerticalEnd } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const props = defineProps<{
  class?: HTMLAttributes["class"]
}>()

const customerId = ref('')
const userSession = useState<string>('user_session', () => '')

function setUserSession() {
  if (import.meta.client) {
    const id = customerId.value.trim()
    if (id) {
      userSession.value = id
      navigateTo('/')
    }
  }
}
</script>

<template>
  <div :class="cn('flex flex-col gap-6', props.class)">
    <form>
      <FieldGroup>
        <div class="flex flex-col items-center gap-2 text-center">
          <a
            href="#"
            class="flex flex-col items-center gap-2 font-medium"
          >
            <div class="flex size-8 items-center justify-center rounded-md">
              <GalleryVerticalEnd class="size-6" />
            </div>
            <span class="sr-only">Acme Inc.</span>
          </a>
          <h1 class="text-xl font-bold">
            Welcome to Acme Inc.
          </h1>
          <FieldDescription>
            Don't have an account?
            <a href="#">
              Sign up
            </a>
          </FieldDescription>
        </div>
        <Field>
          <FieldLabel for="email">
            Customer ID
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="e.g. 12345"
            v-model="customerId"
            required
          />
        </Field>
        <Field>
          <Button type="submit" @click.prevent="setUserSession()" v-if="customerId.trim() != ''">
            Login
          </Button>
          <Button type="submit" disabled v-else>
            Login
          </Button>
        </Field>
      </FieldGroup>
    </form>
    <FieldDescription class="px-6 text-center">
      By clicking continue, you agree to our <a href="#">Terms of Service</a>
      and <a href="#">Privacy Policy</a>.
    </FieldDescription>
  </div>
</template>
