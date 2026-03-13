'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { podeAcessar, ABAS, Role } from '@/lib/utils/usuario'

interface UsuarioData {
  id: string
  nome: string
  role: Role
  ativo: boolean
}

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [usuario, setUsuario] = useState<UsuarioData | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession()
        
        if (authError || !session) {
          router.push('/login')
          return
        }

        const { data: usuarioData, error: usuarioError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (usuarioError || !usuarioData) {
          const { data: newUser, error: insertError } = await supabase
            .from('usuarios')
            .insert({
              id: session.user.id,
              nome: session.user.email?.split('@')[0] || 'Usuário',
              role: 'comum',
              ativo: true
            })
            .select()
            .single()

          if (insertError || !newUser) {
            console.error('Erro ao criar usuário:', insertError)
            router.push('/login')
            return
          }

          setUsuario(newUser)
        } else {
          if (!usuarioData.ativo) {
            await supabase.auth.signOut()
            router.push('/login')
            return
          }
          setUsuario(usuarioData)
        }

        const pathParts = pathname.split('/').filter(Boolean)
        const currentPage = pathParts[0] === 'dashboard' ? pathParts[1] : 'dashboard'

        if (currentPage && usuarioData) {
          const temPermissao = podeAcessar(usuarioData.role as Role, currentPage)
          
          if (!temPermissao) {
            router.push('/dashboard')
            return
          }
        }

        setIsAuthorized(true)
        setLoading(false)
      } catch (err) {
        console.error('Erro na autenticação:', err)
        router.push('/login')
      }
    }

    checkAuth()
  }, [router, pathname, supabase])

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
