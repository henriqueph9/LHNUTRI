import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from 'firebase/auth'
import {
  doc,
  setDoc,
  getFirestore,
} from 'firebase/firestore'
import app from '../firebase'

export default function LoginPage() {
  const router = useRouter()
  const auth = getAuth(app)
  const db = getFirestore(app)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  const handleCadastro = async (e) => {
    e.preventDefault()
    setErro('')

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, senha)
      const user = userCredential.user

      await updateProfile(user, { displayName: nome })

      await setDoc(doc(db, 'usuarios', user.uid), {
        nome,
        email,
        uid: user.uid,
      })

      router.push('/dashboard')
    } catch (error) {
      setErro(error.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-6">
          <div className="text-green-700 font-bold text-3xl mb-2">🍏 LH Nutri</div>
          <p className="text-gray-600 text-sm">Comece seu acompanhamento com o Nutri Luiz Henrique</p>
        </div>

        <form onSubmit={handleCadastro} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="E-mail"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          {erro && <p className="text-red-500 text-sm text-center">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem uma conta? <span className="underline cursor-pointer">Entrar</span>
        </p>
      </div>
    </div>
  )
}
