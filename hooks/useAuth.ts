import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function useAuth() {
  const router = useRouter()

  useEffect(() => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1]
    
    if (!token) {
      router.push('/')
    }
  }, [router])
}