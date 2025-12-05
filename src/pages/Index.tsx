"use client";

import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl">
          Bem-vindo ao Seu App!
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600">
          Este é o ponto de partida para o seu incrível projeto. Explore a navegação acima e comece a construir!
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/auth"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Ir para Login
          </a>
          <a href="#" className="text-sm font-semibold leading-6 text-gray-900">
            Saiba mais <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <div className="absolute bottom-0 w-full">
        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;