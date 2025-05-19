import React, { useState, useEffect } from "react";
import { db } from "../firebase"; // ajuste se o caminho for diferente
import { doc, setDoc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function DiaRegistro({ data }) {
  const [user, setUser] = useState(null);
  const [treino, setTreino] = useState(null);
  const [dieta, setDieta] = useState(null);
  const [agua, setAgua] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [locked, setLocked] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  const dataFormatada = data.toISOString().split("T")[0]; // ex: 2025-05-18

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const docRef = doc(db, "usuarios", firebaseUser.uid, "dias", dataFormatada);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const dados = docSnap.data();
          setTreino(dados.treino);
          setDieta(dados.dieta);
          setAgua(dados.agua);
          setObservacao(dados.observacao || "");
          setLocked(true);
          setMensagemSucesso("Enviado com sucesso!");
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const enviarDados = async () => {
    if (!user) return;

    const docRef = doc(db, "usuarios", user.uid, "dias", dataFormatada);
    await setDoc(docRef, {
      treino,
      dieta,
      agua,
      observacao,
      enviadoEm: new Date().toISOString(),
    });

    setLocked(true);
    setMensagemSucesso("Enviado com sucesso!");
  };

  const editar = () => setLocked(false);

  return (
    <div className="border p-4 rounded-xl shadow-md bg-white my-4">
      <h2 className="font-bold text-lg mb-2">
        {data.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
        })}
      </h2>

      <div className="flex flex-col gap-2">
        <div>
          <p>Treino:</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTreino(true)}
              disabled={locked}
              className={`px-3 py-1 rounded ${
                treino === true ? "bg-green-500 text-white" : "bg-gray-200"
              } ${locked ? "opacity-50" : ""}`}
            >
              ✔️
            </button>
            <button
              onClick={() => setTreino(false)}
              disabled={locked}
              className={`px-3 py-1 rounded ${
                treino === false ? "bg-red-500 text-white" : "bg-gray-200"
              } ${locked ? "opacity-50" : ""}`}
            >
              ❌
            </button>
          </div>
        </div>

        <div>
          <p>Dieta:</p>
          <div className="flex gap-2">
            <button
              onClick={() => setDieta(true)}
              disabled={locked}
              className={`px-3 py-1 rounded ${
                dieta === true ? "bg-green-500 text-white" : "bg-gray-200"
              } ${locked ? "opacity-50" : ""}`}
            >
              ✔️
            </button>
            <button
              onClick={() => setDieta(false)}
              disabled={locked}
              className={`px-3 py-1 rounded ${
                dieta === false ? "bg-red-500 text-white" : "bg-gray-200"
              } ${locked ? "opacity-50" : ""}`}
            >
              ❌
            </button>
          </div>
        </div>

        <div>
          <p>Água:</p>
          <div className="flex gap-2">
            <button
              onClick={() => setAgua(true)}
              disabled={locked}
              className={`px-3 py-1 rounded ${
                agua === true ? "bg-green-500 text-white" : "bg-gray-200"
              } ${locked ? "opacity-50" : ""}`}
            >
              ✔️
            </button>
            <button
              onClick={() => setAgua(false)}
              disabled={locked}
              className={`px-3 py-1 rounded ${
                agua === false ? "bg-red-500 text-white" : "bg-gray-200"
              } ${locked ? "opacity-50" : ""}`}
            >
              ❌
            </button>
          </div>
        </div>

        <div>
          <p>Observação:</p>
          <textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            disabled={locked}
            className="w-full border rounded p-2"
          />
        </div>

        {!locked && (
          <button
            onClick={enviarDados}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Enviar
          </button>
        )}

        {mensagemSucesso && (
          <div className="mt-4 bg-green-100 text-green-700 p-2 rounded">
            {mensagemSucesso}
            <button
              onClick={editar}
              className="block mt-2 text-sm text-blue-600 underline"
            >
              Editar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
