import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [processes, setProcesses] = useState([
  ]);

  const addProcess = () => {
    const name = prompt("Nombre del proceso (ej: P1):");
    if (!name) return;

    const arrival = parseInt(prompt("Tiempo de llegada (arrival):"), 10);
    if (isNaN(arrival)) {
      alert("Arrival inválido");
      return;
    }

    const burst = parseInt(prompt("Tiempo de ejecución (burst):"), 10);
    if (isNaN(burst)) {
      alert("Burst inválido");
      return;
    }

    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;

    setProcesses([
      ...processes,
      { id: name, arrival, burst, color: randomColor }
    ]);
  };

  const deleteProcess = (id) => {
    const confirmDelete = window.confirm(`¿Eliminar ${id}?`);
    if (!confirmDelete) return;

    setProcesses(processes.filter(p => p.id !== id));
  };

  const addRandomProcess = () => {
    
  }

  return (
    <div className="layout-wrapper">
      {/* SECCIÓN IZQUIERDA: 2 COLUMNAS */}
      <aside className="sidebar">
        <div className="robot-container">
           {/* Aquí iría tu imagen añadida */}
           <div className="robot-placeholder robot-img" style={{height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
             🤖
           </div>
        </div>
        
        <h1 className="title" style={{fontSize: '2.5rem', fontWeight: '800'}}>
          RR <span style={{color: 'var(--air-blue)'}}>vs</span> MLQ <span style={{color: 'var( --air-blue)'}}>vs</span> SRTF
        </h1>
        <p style={{color: 'var(--pink-lavender)', letterSpacing: '4px'}}>SIMULATOR</p>

        <div className="controls">
          <div className= "quantum" style={{textAlign: 'left'}}>
            <label style={{fontSize: '1rem', color: ' #B8C7E0', margin: 2, marginTop: 4}}>QUANTUM</label>
            <input type="number" defaultValue="4" className="custom-input" />
          </div>
          <div className='buttonsDiv'>
            <button className="btn-secondary" style={{border: '2px solid var(--pink-lavender)', background: 'none', color: 'var(--pink-lavender)', padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold'}}>
              GENERATE RANDOM
            </button>
            <button className="btn-primary">START SIMULATION</button>
          </div>
        </div>
      </aside>

      {/* SECCIÓN DERECHA: 4 COLUMNAS */}
      <main className="process-panel">
        <h2 style={{ fontSize: '3rem', opacity: 0.9, color: '#EAF2FF'}}>Processes</h2>
        
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
          {processes.map((p, index) => (
            <div key={p.id} className="process-card" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="color-box" style={{ backgroundColor: p.color, width: '50px', height: '50px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}></div>
              <div>
                <strong style={{fontSize: '1.4rem', display: 'block'}}>{p.id}</strong>
                <span style={{color: 'var(--air-blue)', fontSize: '0.9rem'}}>Arr: {p.arrival}s | Burst: {p.burst}s</span>
              </div>
              <button 
                className="delete-btn"
                onClick={() => deleteProcess(p.id)}
              >
                X
              </button>
            </div>
          ))}
        </div>

        <button onClick={addProcess} className="add-btn" >
          + ADD NEW PROCCESS
        </button>
      </main>
    </div>
  );
};

export default App;