import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore'
import app from '../firebase'
import { ClipboardList, FileText, LineChart, LogOut } from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'

export default function Dashboard() {
  const [nome, setNome] = useState('')
  const [motivacao, setMotivacao] = useState('')
  const [progresso, setProgresso] = useState({ dieta: 0, treino: 0, agua: 0 })
  const [userId, setUserId] = useState('')
  const router = useRouter()
  const auth = getAuth(app)
  const db = getFirestore(app)

  const frases = [
    'Cada dia é uma nova chance de vencer! 💪',
    'Consistência supera motivação!',
    'Vamos com tudo hoje? Estou com você! 🚀',
    'Seu esforço está valendo a pena!',
    'Disciplina é fazer mesmo sem vontade.',
    'Corpo saudável, mente blindada! 🧠'
  ]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setNome(user.displayName?.split(' ')[0] || 'Paciente')
        setUserId(user.uid)
        setMotivacao(frases[Math.floor(Math.random() * frases.length)])
        buscarChecklists(user.uid)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [])

  const buscarChecklists = async (uid) => {
    const hoje = new Date()
    const inicioSemana = startOfWeek(hoje, { weekStartsOn: 1 })
    const fimSemana = endOfWeek(hoje, { weekStartsOn: 1 })

    const checkRef = collection(db, `usuarios/${uid}/checklists`)
    const snap = await getDocs(
      query(checkRef,
        where('data', '>=', Timestamp.fromDate(inicioSemana)),
        where('data', '<=', Timestamp.fromDate(fimSemana))
      )
    )

    let dieta = 0, treino = 0, agua = 0
    snap.forEach(doc => {
      const d = doc.data()
      if (d.dieta) dieta++
      if (d.treino) treino++
      if (d.agua) agua++
    })

    setProgresso({ dieta, treino, agua })
  }

  const sair = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const Card = ({ icon: Icon, title, description, onClick }) => (
    <div
      onClick={onClick}
      className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow hover:shadow-md transition cursor-pointer"
    >
      <div className="bg-[#E6F5F2] p-2 rounded-xl">
        <Icon size={20} className="text-[#12736C]" />
      </div>
      <div className="flex flex-col text-left">
        <p className="font-medium text-gray-800">{title}</p>
        {description && (
          <p className="text-sm text-gray-500">{description}</p>
        )}
      </div>
    </div>
  )

  const MetaBarra = ({ label, valor }) => (
    <div className="mb-2">
      <p className="text-sm text-gray-700 mb-1">{label} ({valor}/7)</p>
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-[#12736C] rounded-full transition-all"
          style={{ width: `${(valor / 7) * 100}%` }}
        ></div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4">
      <div className="w-full max-w-xs space-y-6">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">Olá,</p>
          <h1 className="text-2xl font-bold text-gray-900">{nome}!</h1>
          <p className="text-sm text-gray-600">{motivacao}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow">
          <h2 className="font-semibold text-gray-800 mb-2">📊 Metas da Semana</h2>
          <MetaBarra label="Dieta" valor={progresso.dieta} />
          <MetaBarra label="Treino" valor={progresso.treino} />
          <MetaBarra label="Água" valor={progresso.agua} />
        </div>

        <Card
          icon={ClipboardList}
          title="Checklist Diário"
          description="Dieta · Treino · Água"
          onClick={() => router.push('/checklist')}
        />
        <Card
          icon={FileText}
          title="Relatório da Noite"
          description="Preencher às 21:00"
          onClick={() => router.push('/relatorio')}
        />
        <Card
          icon={LineChart}
          title="Evolução"
          onClick={() => router.push('/evolucao')}
        />

        <button
          onClick={sair}
          className="text-sm text-center text-gray-500 mt-4 hover:underline flex justify-center items-center gap-1"
        >
          <LogOut size={16} /> Sair da conta
        </button>
      </div>
    </div>
  )
}
