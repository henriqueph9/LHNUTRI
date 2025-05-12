import { useState } from 'react'
import { useRouter } from 'next/router'
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'
import app from '../firebase'

export default function Register() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const router = useRouter()
  const auth = getAuth(app)
  const db = getFirestore(app)

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!nome || !email || !senha) {
      setErro('Preencha todos os campos')
      return
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, senha)
      await updateProfile(userCred.user, { displayName: nome })

      await setDoc(doc(db, 'usuarios', userCred.user.uid), {
        uid: userCred.user.uid,
        nome,
        email,
        criadoEm: new Date(),
      })

      router.push('/dashboard')
    } catch (err) {
      setErro('Erro ao registrar. Verifique os dados.')
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <img src="/logo.png" alt="logo" className="w-12 h-12" />
          <h1 className="text-2xl font-bold text-green-700">LH Nutri</h1>
          <p className="text-sm text-gray-600 text-center mt-1">
            Comece seu acompanhamento com o Nutri Luiz Henrique
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="Nome completo"
            className="w-full border border-gray-300 rounded-xl p-3"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            type="email"
            placeholder="E-mail"
            className="w-full border border-gray-300 rounded-xl p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full border border-gray-300 rounded-xl p-3"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erro && <p className="text-red-500 text-sm">{erro}</p>}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Cadastrar
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Já tem uma conta?{' '}
          <a href="/login" className="text-green-700 font-medium underline">
            Entrar
          </a>
        </p>
      </div>
    </div>
  )
}
