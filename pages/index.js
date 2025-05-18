import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/login') // Redireciona automaticamente para a tela de login
  }, [router])

  return null // Não renderiza nada na página inicial
}
