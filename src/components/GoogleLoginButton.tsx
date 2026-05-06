'use client'

import { Button } from '@mantine/core'
import { IconBrandGoogle } from '@tabler/icons-react'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

export function GoogleLoginButton() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    
    // 100% bulletproof: use the browser's exact origin
    const baseUrl = window.location.origin
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${baseUrl}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
  }

  return (
    <Button 
      fullWidth 
      variant="default" 
      onClick={handleGoogleLogin} 
      loading={loading}
      leftSection={<IconBrandGoogle size={18} />}
    >
      Sign in with Google
    </Button>
  )
}
