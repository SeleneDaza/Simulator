import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// Importaciones del motor
import { vrrTick } from "./algorithms/roundRobin";
import { mlfqTick } from "./algorithms/mlfq";
import { srtfTick } from "./algorithms/srtf";
import { Process } from "./models/Process";
import { calculateStats } from "./algorithms/calculateStats"; // Importamos la matemática desde la capa lógica

// Importaciones de la 3 paginas
import ConfigView from './views/ConfigView.jsx';
import SimulationView from './views/SimulationView.jsx';
import ResultsView from './views/ResultsView.jsx';

const App = () => {
  const [currentView, setCurrentView] = useState('CONFIG');
  const [processes, setProcesses] = useState([]);
  const [quantum, setQuantum] = useState(4);
  const [clock, setClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const pendingVRR = useRef([]);
  const pendingMLFQ = useRef([]);
  const pendingSRTF = useRef([]);

  // Agregamos un campo "stats" a las referencias para que el algoritmo guarde sus resultados ahí
  const simVRR = useRef({ readyQueue: [], auxQueue: [], ioList: [], running: null, completed: [], timeline: [], stats: null });
  const simMLFQ = useRef({ queues: [[], [], []], ioList: [], running: null, completed: [], timeline: [], stats: null });
  const simSRTF = useRef({ readyQueue: [], ioList: [], running: null, completed: [], timeline: [], stats: null });

  const [vrrResult, setVrrResult] = useState(simVRR.current);
  const [mlfqResult, setMlfqResult] = useState(simMLFQ.current);
  const [srtfResult, setSrtfResult] = useState(simSRTF.current);

  // Bucle de Simulación
  useEffect(() => {
    let timer;
    if (isPlaying && currentView === 'SIMULATION') {
      timer = setInterval(() => {
        // Lógica de VRR
        const arrVRR = pendingVRR.current.filter(p => p.arrivalTime === clock);
        pendingVRR.current = pendingVRR.current.filter(p => p.arrivalTime > clock);
        arrVRR.forEach(p => simVRR.current.readyQueue.push(p));
        vrrTick(simVRR.current, clock, quantum);
        simVRR.current.timeline.push(simVRR.current.running ? simVRR.current.running.pid : "IDLE");

        // Lógica de MLFQ
        const arrMLFQ = pendingMLFQ.current.filter(p => p.arrivalTime === clock);
        pendingMLFQ.current = pendingMLFQ.current.filter(p => p.arrivalTime > clock);
        arrMLFQ.forEach(p => simMLFQ.current.queues[0].push(p));
        mlfqTick(simMLFQ.current, clock);
        simMLFQ.current.timeline.push(simMLFQ.current.running ? simMLFQ.current.running.pid : "IDLE");

        // Lógica de SRTF
        const arrSRTF = pendingSRTF.current.filter(p => p.arrivalTime === clock);
        pendingSRTF.current = pendingSRTF.current.filter(p => p.arrivalTime > clock);
        arrSRTF.forEach(p => simSRTF.current.readyQueue.push(p));
        srtfTick(simSRTF.current, clock);
        simSRTF.current.timeline.push(simSRTF.current.running ? simSRTF.current.running.pid : "IDLE");

        setVrrResult({ ...simVRR.current });
        setMlfqResult({ ...simMLFQ.current });
        setSrtfResult({ ...simSRTF.current });
        setClock(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, clock, currentView, quantum]);

  // Funciones puente
  const handleStartSimulation = () => {
    if (processes.length === 0) return alert("Agrega procesos.");
    const getInitial = () => processes.map(p => {
      const proc = new Process({ pid: p.id, arrivalTime: p.arrival, burstTime: p.burst, ioRequestTime: p.ioRequestTime });
      proc.color = p.color;
      return proc;
    });
    pendingVRR.current = getInitial(); pendingMLFQ.current = getInitial(); pendingSRTF.current = getInitial();

    // 1. Iniciamos la reproducción automáticamente
    setIsPlaying(true);
    setCurrentView('SIMULATION');
  };

  const handleFinishSimulation = () => {
    setIsPlaying(false);
    // AQUÍ DELEGAMOS EL CÁLCULO A LA CAPA LÓGICA ANTES DE RENDERIZAR LA VISTA
    simVRR.current.stats = calculateStats(simVRR.current.timeline, processes);
    simMLFQ.current.stats = calculateStats(simMLFQ.current.timeline, processes);
    simSRTF.current.stats = calculateStats(simSRTF.current.timeline, processes);

    // Actualizamos el estado para que la vista 3 reciba los datos ya procesados
    setVrrResult({ ...simVRR.current });
    setMlfqResult({ ...simMLFQ.current });
    setSrtfResult({ ...simSRTF.current });

    setCurrentView('RESULTS');
  };

  // Renderizado Condicional Limpio
  return (
      <>
        {currentView === 'CONFIG' && (
            <ConfigView
                processes={processes}
                setProcesses={setProcesses}
                quantum={quantum}
                setQuantum={setQuantum}
                onStart={handleStartSimulation}
            />
        )}

        {currentView === 'SIMULATION' && (
            <SimulationView
                processes={processes}
                quantum={quantum}
                clock={clock}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                vrrResult={vrrResult}
                mlfqResult={mlfqResult}
                srtfResult={srtfResult}
                onFinish={handleFinishSimulation}
            />
        )}

        {currentView === 'RESULTS' && (
            <ResultsView
                statsVRR={vrrResult.stats}
                statsMLFQ={mlfqResult.stats}
                statsSRTF={srtfResult.stats}
            />
        )}
      </>
  );
};

export default App;