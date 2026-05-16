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
    </div>
  );
}

export default App;