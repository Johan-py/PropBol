function App(): JSX.Element {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '40px',
        borderRadius: '10px',
        backgroundColor: '#e08200',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#565353', marginBottom: '20px' }}>
          ¡Bienvenido! 🎉
        </h1>
        <p style={{ fontSize: '18px', color: '#666' }}>
          Este es tu componente de bienvenida
        </p>
      </div>

      <div style={{
        textAlign: 'center',
        padding: '40px',
        borderRadius: '10px',
        backgroundColor: '#f5f5f5',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        width: '400px'
      }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>
          Acciones Disponibles
        </h2>
        <p style={{ fontSize: '16px', color: '#666', marginBottom: '25px' }}>
          Este botón no te redirigirá a ninguna parte
        </p>
      </div>
    </div>
  );
}

export default App;