import { useState } from 'react'
import { useRouter } from 'next/router'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import app from '../firebase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const auth = getAuth(app)

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, senha)
      router.push('/dashboard')
    } catch (error) {
      setErro('E-mail ou senha inválidos')
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-sm p-6 rounded-2xl shadow space-y-5 text-center">
        <div className="flex flex-col items-center space-y-1">
          <img src="/logo.png" alt="LH Nutri" className="w-10 h-10" />
          <h1 className="text-2xl font-bold text-[#12736C]">LH Nutri</h1>
          <p className="text-sm text-gray-600 leading-tight">
            Comece seu acompanhamento com o Nutri Luiz Henrique
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl p-3"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-xl p-3"
          />
          {erro && <p className="text-sm text-red-600 text-center">{erro}</p>}
          <button className="w-full bg-[#12736C] text-white py-3 rounded-xl font-semibold">
            Entrar
          </button>
        </form>

        <p className="text-sm text-gray-600">
          Ainda não tem conta?{' '}
          <a href="/register" className="text-[#12736C] underline">Cadastre-se</a>
        </p>
      </div>
    </div>
  )
}
