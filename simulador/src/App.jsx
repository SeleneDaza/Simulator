import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// --- IMPORTACIONES DEL MOTOR ---
import { vrrTick } from "./algorithms/roundRobin";
import { mlfqTick } from "./algorithms/mlfq";
import { srtfTick } from "./algorithms/srtf";
import { Process } from "./models/Process";

// Función Helper para el UI Dev (Comprime el historial)
const formatTimeline = (timelineArray) => {
  const blocks = [];
  let current = null;
  timelineArray.forEach((pid, index) => {
    if (!current || current.pid !== pid) {
      if (current) {
        current.end = index;
        blocks.push(current);
      }
      current = { pid, start: index, end: index + 1 };
    } else {
      current.end = index + 1;
    }
  });
  if (current && !blocks.includes(current)) blocks.push(current);
  return blocks;
};

// Etiqueta visual para los procesos en las colas (igual que antes)
const QueueBadge = ({ pid, processes }) => {
  const processData = processes.find(p => p.id === pid);
  const bgColor = processData ? processData.color : '#555';

  return (
      <span style={{
        backgroundColor: bgColor, color: '#fff', padding: '4px 10px',
        borderRadius: '6px', marginRight: '8px', fontWeight: 'bold',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
      {pid}
    </span>
  );
};

// --- NUEVO Y MEJORADO COMPONENTE: Diagrama de Gantt (Estilo imágenes) ---
const GanttChart = ({ timeline, processes }) => {
  if (timeline.length === 0) return <div style={{ color: '#888' }}>Esperando ejecución...</div>;

  const totalTime = timeline[timeline.length - 1].end;
  // Manejo de caso degenerado
  if (totalTime === 0) return <div style={{ color: '#888' }}>Sin datos...</div>;

  return (
      // 1. Contenedor principal con overflow: visible y espacio inferior para números
      <div style={{ position: 'relative', width: '100%', overflow: 'visible', marginBottom: '35px' }}>

        {/* Título arriba de la gráfica */}
        <h4 style={{margin: '0 0 10px 0', color: '#b8c7e0', fontSize: '0.9rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '1px'}}>Gantt Chart</h4>

        {/* 2. Contenedor de las barras de colores: Con borde negro y esquinas redondeadas */}
        <div style={{ display: 'flex', height: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', border: '2px solid black' }}>
          {timeline.map((block, i) => {
            const duration = block.end - block.start;
            const processData = processes.find(p => p.id === block.pid);
            const bgColor = processData ? processData.color : 'transparent';
            const isIdle = block.pid === 'IDLE';

            return (
                <div key={i} style={{
                  flex: duration, /* Ancho proporcional a la duración */
                  backgroundColor: bgColor,
                  borderLeft: (i > 0 ? '2px solid black' : 'none'), /* Borde sólido negro SOLO entre bloques */
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: isIdle ? '#666' : '#fff',
                  fontSize: '0.8rem', fontWeight: 'bold'
                }}>
                  {/* Solo el PID en minúsculas y con sombra, centrado. Los segundos se eliminaron. */}
                  {!isIdle && <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{block.pid.toLowerCase()}</span>}
                </div>
            );
          })}
        </div>

        {/* 3. LÍNEA DE TIEMPO (NÚMEROS ABAJO): Absolutamente posicionada */}
        {timeline.map((block, i) => (
            <div
                key={`time-${i}`}
                style={{
                  position: 'absolute',
                  left: `${(block.end / totalTime) * 100}%`, /* Posiciona en el final del bloque */
                  transform: 'translateX(-50%)', /* Centra el número en la línea */
                  top: '100%', /* Coloca por debajo del chart */
                  marginTop: '5px',
                  fontSize: '0.8rem',
                  color: '#fff',
                }}
            >
              {block.end}
            </div>
        ))}
        {/* No te olvides de poner el '0' inicial */}
        <div
            style={{
              position: 'absolute',
              left: '0%',
              transform: 'translateX(-50%)',
              top: '100%',
              marginTop: '5px',
              fontSize: '0.8rem',
              color: '#fff',
            }}
        >
          0
        </div>
      </div>
  );
};

const App = () => {
  // ==========================================
  // ESTADOS DE LA VISTA DE CONFIGURACIÓN
  // ==========================================
  const [processes, setProcesses] = useState([]);
  const [quantum, setQuantum] = useState(4);
  const [isSimulating, setIsSimulating] = useState(false);

  // ==========================================
  // ESTADOS Y REFS DEL MOTOR DE SIMULACIÓN
  // ==========================================
  const [clock, setClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const pendingVRR = useRef([]);
  const pendingMLFQ = useRef([]);
  const pendingSRTF = useRef([]);

  const simVRR = useRef({ readyQueue: [], auxQueue: [], ioList: [], running: null, completed: [], timeline: [] });
  const simMLFQ = useRef({ queues: [[], [], []], ioList: [], running: null, completed: [], timeline: [] });
  const simSRTF = useRef({ readyQueue: [], ioList: [], running: null, completed: [], timeline: [] });

  const [vrrResult, setVrrResult] = useState(simVRR.current);
  const [mlfqResult, setMlfqResult] = useState(simMLFQ.current);
  const [srtfResult, setSrtfResult] = useState(simSRTF.current);

  // ==========================================
  // FUNCIONES DE CONFIGURACIÓN (Actualizadas para I/O)
  // ==========================================
  const addProcess = () => {
    const name = prompt("Nombre del proceso (ej: P1):");
    if (!name) return;

    const arrival = parseInt(prompt("Tiempo de llegada (arrival):"), 10);
    if (isNaN(arrival)) return alert("Arrival inválido");

    const burst = parseInt(prompt("Tiempo de ejecución (burst):"), 10);
    if (isNaN(burst) || burst <= 0) return alert("Burst inválido");

    // NUEVO: Preguntar por I/O
    const ioInput = prompt(`¿En qué momento de su ejecución solicita I/O? (Opcional.\nDebe ser menor a ${burst}. Deja vacío si no tiene):`);
    let ioRequestTime = null;

    if (ioInput !== null && ioInput.trim() !== "") {
      ioRequestTime = parseInt(ioInput, 10);
      if (isNaN(ioRequestTime) || ioRequestTime <= 0 || ioRequestTime >= burst) {
        return alert(`I/O inválido. Debe ser un número entre 1 y ${burst - 1}`);
      }
    }

    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    setProcesses([...processes, { id: name, arrival, burst, ioRequestTime, color: randomColor }]);
  };

  const deleteProcess = (id) => {
    if (window.confirm(`¿Eliminar ${id}?`)) {
      setProcesses(processes.filter(p => p.id !== id));
    }
  };

  const addRandomProcess = () => {
    const randomId = `P${processes.length + 1}`;
    const randomArrival = Math.floor(Math.random() * 15);
    const randomBurst = Math.floor(Math.random() * 10) + 2; // Ráfaga entre 2 y 11 para que tenga sentido el I/O
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16)}`;

    // NUEVO: 30% de probabilidad de tener I/O
    let ioRequestTime = null;
    if (Math.random() < 0.3 && randomBurst > 2) {
      // Solicita I/O en algún momento a la mitad de su ejecución
      ioRequestTime = Math.floor(Math.random() * (randomBurst - 2)) + 1;
    }

    setProcesses([...processes, { id: randomId, arrival: randomArrival, burst: randomBurst, ioRequestTime, color: randomColor }]);
  };

  const handleStartSimulation = () => {
    if (processes.length === 0) {
      alert("Agrega al menos un proceso para simular.");
      return;
    }

    // Convertimos los datos de la UI al modelo del motor, AHORA PASANDO EL I/O
    const getInitial = () => processes.map(p => {
      const proc = new Process({
        pid: p.id,
        arrivalTime: p.arrival,
        burstTime: p.burst,
        ioRequestTime: p.ioRequestTime
      });
      proc.color = p.color;
      return proc;
    });

    pendingVRR.current = getInitial();
    pendingMLFQ.current = getInitial();
    pendingSRTF.current = getInitial();

    setIsSimulating(true);
  };

  // ==========================================
  // BUCLE DE SIMULACIÓN (useEffect)
  // ==========================================
  useEffect(() => {
    let timer;
    if (isPlaying && isSimulating) {
      timer = setInterval(() => {
        // VRR
        const arrVRR = pendingVRR.current.filter(p => p.arrivalTime === clock);
        pendingVRR.current = pendingVRR.current.filter(p => p.arrivalTime > clock);
        arrVRR.forEach(p => simVRR.current.readyQueue.push(p));
        vrrTick(simVRR.current, clock, quantum);
        simVRR.current.timeline.push(simVRR.current.running ? simVRR.current.running.pid : "IDLE");

        // MLFQ
        const arrMLFQ = pendingMLFQ.current.filter(p => p.arrivalTime === clock);
        pendingMLFQ.current = pendingMLFQ.current.filter(p => p.arrivalTime > clock);
        arrMLFQ.forEach(p => simMLFQ.current.queues[0].push(p));
        mlfqTick(simMLFQ.current, clock);
        simMLFQ.current.timeline.push(simMLFQ.current.running ? simMLFQ.current.running.pid : "IDLE");

        // SRTF
        const arrSRTF = pendingSRTF.current.filter(p => p.arrivalTime === clock);
        pendingSRTF.current = pendingSRTF.current.filter(p => p.arrivalTime > clock);
        arrSRTF.forEach(p => simSRTF.current.readyQueue.push(p));
        srtfTick(simSRTF.current, clock);
        simSRTF.current.timeline.push(simSRTF.current.running ? simSRTF.current.running.pid : "IDLE");

        // Actualizar UI
        setVrrResult({ ...simVRR.current });
        setMlfqResult({ ...simMLFQ.current });
        setSrtfResult({ ...simSRTF.current });
        setClock(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, clock, isSimulating, quantum]);

  // ==========================================
  // RENDERIZADO CONDICIONAL
  // ==========================================

  // PANTALLA 1: CONFIGURACIÓN
  if (!isSimulating) {
    return (
        <div className="layout-wrapper">
          <aside className="sidebar">
            <div className="robot-container">
              <div className="robot-placeholder robot-img" style={{height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                🤖
              </div>
            </div>

            <h1 className="title" style={{fontSize: '2.5rem', fontWeight: '800'}}>
              RR <span style={{color: 'var(--air-blue)'}}>vs</span> MLQ <span style={{color: 'var(--air-blue)'}}>vs</span> SRTF
            </h1>
            <p style={{color: 'var(--pink-lavender)', letterSpacing: '4px'}}>SIMULATOR</p>

            <div className="controls">
              <div className= "quantum" style={{textAlign: 'left'}}>
                <label style={{fontSize: '1rem', color: ' #B8C7E0', margin: 2, marginTop: 4}}>QUANTUM (Para RR)</label>
                <input
                    type="number"
                    value={quantum}
                    onChange={(e) => setQuantum(parseInt(e.target.value) || 1)}
                    className="custom-input"
                />
              </div>
              <div className='buttonsDiv'>
                <button onClick={addRandomProcess} className="btn-secondary" style={{border: '2px solid var(--pink-lavender)', background: 'none', color: 'var(--pink-lavender)', padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold'}}>
                  GENERATE RANDOM
                </button>
                <button onClick={handleStartSimulation} className="btn-primary">START SIMULATION</button>
              </div>
            </div>
          </aside>

          <main className="process-panel">
            <h2 style={{ fontSize: '3rem', opacity: 0.9, color: '#EAF2FF'}}>Processes</h2>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
              {processes.map((p, index) => (
                  <div key={p.id} className="process-card" style={{animationDelay: `${index * 0.1}s`}}>
                    <div className="color-box" style={{ backgroundColor: p.color, width: '50px', height: '50px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}></div>
                    <div>
                      <strong style={{fontSize: '1.4rem', display: 'block'}}>{p.id}</strong>
                      <span style={{color: 'var(--air-blue)', fontSize: '0.9rem'}}>
                    Arr: {p.arrival}s | Burst: {p.burst}s
                        {/* NUEVO: Mostrar I/O si existe */}
                        {p.ioRequestTime && <><br /><span style={{color: '#ff85c0'}}>⏳ I/O al tick {p.ioRequestTime}</span></>}
                  </span>
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
              + ADD NEW PROCESS
            </button>
          </main>
        </div>
    );
  }

// PANTALLA 2: SIMULACIÓN
  return (
      <div style={{
        padding: '20px',
        color: 'white',
        width: '100vw',       /* Ocupa todo el ancho */
        height: '100vh',      /* Ocupa todo el alto */
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'    /* Oculta cualquier scroll */
      }}>

        {/* HEADER: Título y controles en la misma línea para ahorrar espacio vertical */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>Dashboard de Simulación</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
              {isPlaying ? "⏸ Pausar" : "▶️ Reproducir"}
            </button>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff85c0' }}>⏰ Tick actual: {clock}</span>
          </div>
        </div>

        {/* CONTENEDOR DE PANELES: Se expande para llenar el resto de la pantalla */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>

          {/* PANEL VRR */}
          <div style={{ flex: 1, border: '1px solid #444', padding: '15px 20px', borderRadius: '12px', backgroundColor: '#131a2d', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: '#007bff', margin: '0 0 10px 0', fontSize: '1.3rem' }}>Round Robin (Q={quantum})</h2>

            <div style={{ display: 'flex', gap: '30px', marginBottom: '10px' }}>
              <div><strong>💻 CPU:</strong> {vrrResult.running ? <QueueBadge pid={vrrResult.running.pid} processes={processes} /> : "IDLE"}</div>
              <div><strong>🟢 Cola Ready:</strong> {vrrResult.readyQueue.length > 0 ? vrrResult.readyQueue.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
              <div><strong>⏳ Cola I/O:</strong> {vrrResult.ioList.length > 0 ? vrrResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
            </div>

            <h4 style={{margin: '5px 0', color: '#b8c7e0', fontSize: '0.9rem'}}>Línea de Tiempo (Gantt Chart):</h4>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ width: '100%' }}><GanttChart timeline={formatTimeline(vrrResult.timeline)} processes={processes} /></div>
            </div>
          </div>

          {/* PANEL MLFQ */}
          <div style={{ flex: 1, border: '1px solid #444', padding: '15px 20px', borderRadius: '12px', backgroundColor: '#131a2d', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: '#28a745', margin: '0 0 10px 0', fontSize: '1.3rem' }}>MLFQ</h2>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '10px' }}>
              <div><strong>💻 CPU:</strong> {mlfqResult.running ? <QueueBadge pid={mlfqResult.running.pid} processes={processes} /> : "IDLE"}</div>
              <div><strong>🥇 Cola 0:</strong> {mlfqResult.queues[0]?.length > 0 ? mlfqResult.queues[0].map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
              <div><strong>🥈 Cola 1:</strong> {mlfqResult.queues[1]?.length > 0 ? mlfqResult.queues[1].map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
              {/* AQUÍ ESTÁ LA COLA 2 QUE FALTABA */}
              <div><strong>🥉 Cola 2:</strong> {mlfqResult.queues[2]?.length > 0 ? mlfqResult.queues[2].map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
              <div><strong>⏳ Cola I/O:</strong> {mlfqResult.ioList.length > 0 ? mlfqResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
            </div>

            <h4 style={{margin: '5px 0', color: '#b8c7e0', fontSize: '0.9rem'}}>Línea de Tiempo (Gantt Chart):</h4>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ width: '100%' }}><GanttChart timeline={formatTimeline(mlfqResult.timeline)} processes={processes} /></div>
            </div>
          </div>

          {/* PANEL SRTF */}
          <div style={{ flex: 1, border: '1px solid #444', padding: '15px 20px', borderRadius: '12px', backgroundColor: '#131a2d', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ color: '#dc3545', margin: '0 0 10px 0', fontSize: '1.3rem' }}>SRTF</h2>

            <div style={{ display: 'flex', gap: '30px', marginBottom: '10px' }}>
              <div><strong>💻 CPU:</strong> {srtfResult.running ? <QueueBadge pid={srtfResult.running.pid} processes={processes} /> : "IDLE"}</div>
              <div><strong>🟢 Cola Ready:</strong> {srtfResult.readyQueue.length > 0 ? srtfResult.readyQueue.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
              <div><strong>⏳ Cola I/O:</strong> {srtfResult.ioList.length > 0 ? srtfResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
            </div>

            <h4 style={{margin: '5px 0', color: '#b8c7e0', fontSize: '0.9rem'}}>Línea de Tiempo (Gantt Chart):</h4>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}>
              <div style={{ width: '100%' }}><GanttChart timeline={formatTimeline(srtfResult.timeline)} processes={processes} /></div>
            </div>
          </div>

        </div>
      </div>
  );
};

export default App;