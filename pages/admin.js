import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  getDocs,
  getFirestore,
  doc,
  query,
  orderBy,
} from 'firebase/firestore'
import app from '../firebase'
import { format, addDays, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function AdminPage() {
  const auth = getAuth(app)
  const db = getFirestore(app)
  const router = useRouter()

  const [usuarios, setUsuarios] = useState([])
  const [acessoNegado, setAcessoNegado] = useState(false)
  const [dataAtual, setDataAtual] = useState(new Date())

  const UID_DO_ADMIN = 'GGT2USGNN2QbzhaTaXTlhHZVro12'
  const dataFormatada = format(dataAtual, 'yyyy-MM-dd')
  const dataTitulo = format(dataAtual, "EEEE, dd 'de' MMMM", { locale: ptBR })

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user && user.uid === UID_DO_ADMIN) {
        const usuariosRef = collection(db, 'usuarios')
        const querySnapshot = await getDocs(usuariosRef)
        const lista = []

        for (const docUser of querySnapshot.docs) {
          const userData = docUser.data()

          const checklistSnap = await getDocs(
            query(collection(db, `usuarios/${userData.uid}/checklists`), orderBy('data'))
          )
          const relatorioSnap = await getDocs(
            query(collection(db, `usuarios/${userData.uid}/relatorios`), orderBy('data'))
          )

          const checklist = checklistSnap.docs.find((doc) => doc.id === dataFormatada)?.data() || null
          const relatorio = relatorioSnap.docs.find((doc) => doc.id === dataFormatada)?.data() || null

          let totalDieta = 0,
            totalTreino = 0,
            totalAgua = 0

          checklistSnap.forEach((doc) => {
            const data = doc.data()
            if (data.dieta) totalDieta++
            if (data.treino) totalTreino++
            if (data.agua) totalAgua++
          })

          const grafico = {
            data: {
              labels: ['Dieta', 'Treino', 'Água'],
              datasets: [
                {
                  label: 'Adesão (✔️)',
                  data: [totalDieta, totalTreino, totalAgua],
                  backgroundColor: ['#10b981', '#f97316', '#6366f1'], // verde, laranja, azul
                },
              ],
            },
            options: {
              responsive: true,
              plugins: {
                legend: { display: false },
                title: { display: true, text: 'Adesão semanal' },
              },
            },
          }

          lista.push({
            nome: userData.nome,
            email: userData.email,
            uid: userData.uid,
            checklist,
            relatorio,
            grafico,
          })
        }

        setUsuarios(lista)
      } else {
        setAcessoNegado(true)
      }
    })
  }, [dataAtual])

  const mudarDia = (direcao) => {
    setDataAtual((prev) =>
      direcao === 'anterior' ? subDays(prev, 1) : addDays(prev, 1)
    )
  }

  if (acessoNegado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center text-red-600 font-semibold">
          Acesso negado. Esta área é restrita ao administrador.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-sm text-gray-600 hover:underline"
        >
          ← Voltar
        </button>
        <h1 className="text-lg font-bold text-gray-800 text-center w-full -ml-8">
          {dataTitulo}
        </h1>
      </div>

      {usuarios.length === 0 ? (
        <p className="text-gray-500">Carregando usuários...</p>
      ) : (
        usuarios.map((user, index) => (
          <div
            key={index}
            className="border p-4 rounded-xl bg-gray-50 shadow-sm mb-4"
          >
            <p className="font-semibold text-lg mb-2">{user.nome}</p>
            <p className="text-sm text-gray-600 mb-2">{user.email}</p>

            {user.checklist ? (
              <div className="mb-2">
                <p className="font-medium text-green-700">Checklist:</p>
                <p>🟢 Dieta: {user.checklist.dieta ? '✔️' : '❌'}</p>
                <p>🏋️ Treino: {user.checklist.treino ? '✔️' : '❌'}</p>
                <p>💧 Água: {user.checklist.agua ? '✔️' : '❌'}</p>
                <p className="text-sm italic text-gray-500">
                  Obs: {user.checklist.observacao}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500 mb-2">
                Nenhum checklist registrado
              </p>
            )}

            {user.relatorio ? (
              <div className="mt-2">
                <p className="font-medium text-blue-700">Relatório da Noite:</p>
                <p>📊 Nota da dieta: {user.relatorio.nota}</p>
                <p>💧 Água: {user.relatorio.agua}</p>
                <p>🏃 Treinou: {user.relatorio.treino}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhum relatório registrado
              </p>
            )}

            {user.grafico ? (
              <div className="mt-4">
                <Bar data={user.grafico.data} options={user.grafico.options} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sem dados suficientes para gráfico.</p>
            )}
          </div>
        ))
      )}

      <div className="flex justify-between mt-6">
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
  )
}
