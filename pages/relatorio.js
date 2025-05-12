import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  getFirestore,
  doc,
  setDoc,
  Timestamp,
  collection,
  getDocs,
  query
} from 'firebase/firestore'
import app from '../firebase'
import { format, addDays, subDays, isToday, getHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Relatorio() {
  const router = useRouter()
  const auth = getAuth(app)
  const db = getFirestore(app)

  const [userId, setUserId] = useState('')
  const [nota, setNota] = useState('')
  const [agua, setAgua] = useState('')
  const [treino, setTreino] = useState(null)
  const [enviado, setEnviado] = useState(false)
  const [dataAtual, setDataAtual] = useState(new Date())
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid)
        buscarRelatorios(user.uid)
      } else {
        router.push('/login')
      }
    })
    return () => unsubscribe()
  }, [])

  const docId = format(dataAtual, 'yyyy-MM-dd')
  const dataFormatada = format(dataAtual, "EEEE, dd 'de' MMMM", { locale: ptBR })
  const mostrarLembrete21h = isToday(dataAtual) && getHours(new Date()) >= 21 && !enviado

  const enviar = async () => {
    if (!userId) return alert('Você precisa estar logado.')

    try {
      const ref = doc(db, `usuarios/${userId}/relatorios/${docId}`)
      await setDoc(ref, {
        nota,
        agua,
        treino,
        data: Timestamp.fromDate(dataAtual),
      })

      const frases = []

      if (nota >= 8) frases.push('📊 Nota excelente!')
      else if (nota >= 5) frases.push('⚠️ Nota regular, atenção redobrada!')
      else frases.push('🚨 Que tal focar mais amanhã na dieta?')

      if (agua === '>2L') frases.push('💧 Hidratação no ponto!')
      else frases.push('🧃 Beba mais água amanhã!')

      if (treino === true) frases.push('🏃 Ótimo treino hoje!')
      else frases.push('😴 Um descanso é válido, mas mantenha a rotina!')

      setFeedback(frases.join(' '))
      setEnviado(true)

      setTimeout(() => setFeedback(''), 5000)
    } catch (error) {
      alert('Erro ao enviar. Tente novamente.')
    }
  }

  const buscarRelatorios = async (uid) => {
    const hoje = new Date()
    const inicioSemana = new Date(hoje.setDate(hoje.getDate() - hoje.getDay() + 1))
    const fimSemana = new Date(inicioSemana)
    fimSemana.setDate(inicioSemana.getDate() + 6)

    const ref = collection(db, `usuarios/${uid}/relatorios`)
    const snap = await getDocs(query(ref))

    const docsSemana = snap.docs.filter(doc => {
      const data = doc.data().data?.toDate?.()
      return data >= inicioSemana && data <= fimSemana
    })

    if (docsSemana.length === 0) return

    const conquistas = []
    let notasAltas = 0
    let treinos = 0
    let aguasOk = 0

    docsSemana.forEach(doc => {
      const d = doc.data()
      if (parseInt(d.nota) >= 8) notasAltas++
      if (d.treino === true) treinos++
      if (d.agua === '>2L') aguasOk++
    })

    if (docsSemana.length >= 5) conquistas.push('🏅 Você marcou 5 relatórios essa semana!')
    if (notasAltas >= 3) conquistas.push('📊 Várias notas acima de 8! Parabéns!')
    if (treinos >= 4) conquistas.push('🏋️ Você treinou 4 vezes ou mais!')
    if (aguasOk >= 5) conquistas.push('💧 Hidratação excelente essa semana!')

    setFeedback(conquistas.join(' '))
  }

  const mudarDia = (direcao) => {
    setDataAtual((prev) =>
      direcao === 'anterior' ? subDays(prev, 1) : addDays(prev, 1)
    )
    setNota('')
    setAgua('')
    setTreino(null)
    setEnviado(false)
    setFeedback('')
  }

  const Botao = ({ label, value, selected, onClick }) => (
    <button
      onClick={() => onClick(value)}
      className={`px-4 py-2 rounded-xl border text-sm ${
        selected === value ? 'bg-[#12736C] text-white' : 'bg-white border-gray-300 text-gray-700'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-sm text-gray-600 hover:underline"
          >
            ← Voltar
          </button>
          <h1 className="text-lg font-bold text-gray-800 text-center w-full -ml-8">
            {dataFormatada}
          </h1>
        </div>

        {mostrarLembrete21h && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 text-sm text-yellow-800 rounded-xl">
            ⚠️ Já são 21h! Hora de registrar seu relatório da noite.
          </div>
        )}

        <div className="bg-white p-4 rounded-2xl shadow border space-y-2">
          <p className="font-semibold text-gray-700">Qual a nota da sua dieta hoje?</p>
          <input
            type="number"
            min={0}
            max={10}
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="0 a 10"
            className="w-full border border-gray-300 p-2 rounded-xl"
          />
        </div>

        <div className="bg-white p-4 rounded-2xl shadow border space-y-2">
          <p className="font-semibold text-gray-700">Quanto de água você bebeu?</p>
          <div className="flex gap-2 flex-wrap">
            <Botao label="< 1 litro" value="<1L" selected={agua} onClick={setAgua} />
            <Botao label="1–2 litros" value="1-2L" selected={agua} onClick={setAgua} />
            <Botao label="> 2 litros" value=">2L" selected={agua} onClick={setAgua} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow border space-y-2">
          <p className="font-semibold text-gray-700">Você treinou hoje?</p>
          <div className="flex gap-4">
            <Botao label="Sim" value={true} selected={treino} onClick={setTreino} />
            <Botao label="Não" value={false} selected={treino} onClick={setTreino} />
          </div>
        </div>

        <button
          onClick={enviar}
          disabled={enviado}
          className={`w-full py-3 rounded-xl font-semibold transition ${
            enviado ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#12736C] text-white'
          }`}
        >
          {enviado ? '✔️ Enviado com sucesso' : 'ENVIAR'}
        </button>

        {feedback && (
          <div className="bg-green-100 border-l-4 border-green-500 p-3 text-sm text-green-800 rounded-xl mt-2">
            {feedback}
          </div>
        )}

        <div className="flex justify-between mt-4">
          <button
            onClick={() => mudarDia('anterior')}
            className="px-4 py-2 bg-gray-200 rounded-xl font-medium text-gray-800 hover:bg-gray-300"
          >
            ← Anterior
          </button>
          <button
            onClick={() => mudarDia('proximo')}
            className="px-4 py-2 bg-gray-200 rounded-xl font-medium text-gray-800 hover:bg-gray-300"
          >
            Próximo →
          </button>
        </div>
      </div>
    </div>
  )
}
