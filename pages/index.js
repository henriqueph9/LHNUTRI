// pages/index.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Se for o admin, manda pro painel admin
        if (user.uid === 'GGT2USGNN2QbzhaTaXTlhHZVro12') {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Não logado → vai pra tela de login
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <div className="p-4 text-center">Carregando...</div>;
}
