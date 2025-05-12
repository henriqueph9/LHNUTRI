import { useState } from 'react'
import { useRouter } from 'next/router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

export default function RegisterPage() {
  const router = useRouter()

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const handleCadastro = async (e) => {
    e.preventDefault()
    setErro('')

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      // Salvar o nome do usuário no Firestore
      await setDoc(doc(db, 'usuarios', user.uid), {
        nome,
        email,
        uid: user.uid,
      })

      router.push('/dashboard')
    } catch (error) {
      setErro('Erro ao criar conta. Verifique os dados.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <form onSubmit={handleCadastro} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/icons/icon-192.png" alt="Logo LH Nutri" className="mx-auto w-12" />
          <h1 className="text-2xl font-bold text-green-700 mt-2">LH Nutri</h1>
          <p className="text-sm text-gray-500">Crie sua conta</p>
        </div>

        {erro && <p className="text-red-500 text-sm mb-3 text-center">{erro}</p>}

        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
        >
          Cadastrar
        </button>

        <p className="mt-4 text-sm text-center text-gray-600">
          Já tem conta? <a href="/login" className="text-green-700 underline">Entrar</a>
        </p>
      </form>
    </div>
  )
}
