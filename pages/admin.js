import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import {
  collection,
  getDocs,
  getFirestore,
  query,
  orderBy,
} from 'firebase/firestore'
import { app } from '../firebase'
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
                  backgroundColor: ['#10b981', '#f97316', '#6366f1'],
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
        <p className="text-red-600 text-lg font-bold">Acesso negado</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Painel do Administrador</h1>
      <h2 className="text-lg mb-6">{dataTitulo}</h2>

      <div className="flex justify-between mb-4">
        <button
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => mudarDia('anterior')}
        >
          Dia Anterior
        </button>
        <button
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => mudarDia('proximo')}
        >
          Próximo Dia
        </button>
      </div>

      <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded mb-6">
        <thead className="bg-gray-100 text-gray-700 text-sm">
          <tr>
            <th className="px-4 py-2 text-left">Nome</th>
            <th className="px-4 py-2 text-left">E-mail</th>
            <th className="px-4 py-2 text-center">Dieta</th>
            <th className="px-4 py-2 text-center">Treino</th>
            <th className="px-4 py-2 text-center">Água</th>
            <th className="px-4 py-2 text-center">Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((usuario, index) => (
            <tr key={index} className="border-b hover:bg-gray-50 text-sm">
              <td className="px-4 py-2">{usuario.nome}</td>
              <td className="px-4 py-2">{usuario.email}</td>
              <td className="px-4 py-2 text-center">
                {usuario.checklist?.dieta ? '✔️' : '❌'}
              </td>
              <td className="px-4 py-2 text-center">
                {usuario.checklist?.treino ? '✔️' : '❌'}
              </td>
              <td className="px-4 py-2 text-center">
                {usuario.checklist?.agua ? '✔️' : '❌'}
              </td>
              <td className="px-4 py-2 text-center">
                <button
                  onClick={() =>
                    alert(JSON.stringify(usuario.relatorio || {}, null, 2))
                  }
                  className="text-blue-600 hover:underline"
                >
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Relatórios e Gráficos Abaixo da Tabela */}
      {usuarios.map((usuario, index) => (
        <div key={index} className="mb-10 border-t pt-4">
          <h3 className="font-semibold mb-2">{usuario.nome} - Gráfico & Relatório</h3>
          <div className="mb-4">
            <strong>Relatório:</strong>
            <pre className="text-sm bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap">
              {JSON.stringify(usuario.relatorio || {}, null, 2)}
            </pre>
          </div>
          <div>
            <Bar data={usuario.grafico.data} options={usuario.grafico.options} />
          </div>
        </div>
      ))}
    </div>
  )
}
