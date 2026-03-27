import React from 'react';

const HeaderPanel: React.FC = () => {
  return (
    <div className="w-full py-4 px-2 border-b border-border mb-4">
      <h1 className="text-xl font-extrabold text-foreground">
        Lista de inmuebles
      </h1>
      <p className="text-sm text-gray-500 mt-1 font-medium">
        3 propiedades encontradas
      </p>
    </div>
  );
};

export default HeaderPanel;