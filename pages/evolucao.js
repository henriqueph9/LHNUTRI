import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
  getAuth,
  onAuthStateChanged
} from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs
} from 'firebase/firestore'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import app from '../firebase'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function Evolucao() {
  const [dadosGrafico, setDadosGrafico] = useState(null)
  const [userId, setUserId] = useState('')
  const router = useRouter()
  const auth = getAuth(app)
  const db = getFirestore(app)

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid)
        const ref = collection(db, `usuarios/${user.uid}/checklists`)
        const snap = await getDocs(ref)

        const dias = []
        const dieta = []
        const treino = []
        const agua = []

        snap.forEach((doc) => {
          const data = doc.id.slice(5) // MM-DD
          dias.push(data)
          const d = doc.data()
          dieta.push(d.dieta ? 1 : 0)
          treino.push(d.treino ? 1 : 0)
          agua.push(d.agua ? 1 : 0)
        })

        setDadosGrafico({
          labels: dias,
          datasets: [
            {
              label: 'Dieta',
              data: dieta,
              backgroundColor: '#10b981'
            },
            {
              label: 'Treino',
              data: treino,
              backgroundColor: '#3b82f6'
            },
            {
              label: 'Água',
              data: agua,
              backgroundColor: '#6366f1'
            }
          ]
        })
      } else {
        router.push('/login')
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-[#f9f9f9] p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Sua Evolução</h1>

        {dadosGrafico ? (
          <div className="bg-white p-4 rounded-2xl shadow border">
            <Bar
              data={dadosGrafico}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: 'top' },
                  title: {
                    display: true,
                    text: 'Histórico de Adesão (✔️)',
                    font: { size: 18 }
                  }
                },
                scales: {
                  y: {
                    ticks: { stepSize: 1, max: 1 }
                  }
                }
              }}
            />
          </div>
        ) : (
          <p className="text-gray-600">Carregando gráfico...</p>
        )}
      </div>
    </div>
  )
}
