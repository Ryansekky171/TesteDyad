import React from "react";

const Header = () => {
  return (
    <header className="bg-primary text-primary-foreground p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Controle de Finanças</h1>
        {/* Futuros elementos de navegação ou usuário podem ir aqui */}
      </div>
    </header>
  );
};

export default Header;