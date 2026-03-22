import { useState, useEffect, useRef } from "react";
import { vrrTick } from "./algorithms/roundRobin";
import { mlfqTick } from "./algorithms/mlfq";
import { srtfTick } from "./algorithms/srtf";
import { Process } from "./models/Process";

const initialData = [
  { pid: "P1", arrivalTime: 0, burstTime: 8, ioRequestTime: null },
  { pid: "P2", arrivalTime: 1, burstTime: 4, ioRequestTime: 2 },
  { pid: "P3", arrivalTime: 3, burstTime: 5, ioRequestTime: null },
  { pid: "P4", arrivalTime: 5, burstTime: 6, ioRequestTime: 3 },
];

const getInitialProcesses = () => initialData.map(d => new Process(d));

// 2. Función Helper para el UI Dev: Comprime el historial en bloques de [Inicio - Fin]
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

function App() {
  // --- MOTOR DE ESTADO (LÓGICA) ---
  const [clock, setClock] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const pendingVRR = useRef(getInitialProcesses());
  const pendingMLFQ = useRef(getInitialProcesses());
  const pendingSRTF = useRef(getInitialProcesses());

  const simVRR = useRef({ readyQueue: [], auxQueue: [], ioList: [], running: null, completed: [], timeline: [] });
  const simMLFQ = useRef({ queues: [[], [], []], ioList: [], running: null, completed: [], timeline: [] });
  const simSRTF = useRef({ readyQueue: [], ioList: [], running: null, completed: [], timeline: [] });

  // --- ESTADOS PARA LA INTERFAZ ---
  const [vrrResult, setVrrResult] = useState(simVRR.current);
  const [mlfqResult, setMlfqResult] = useState(simMLFQ.current);
  const [srtfResult, setSrtfResult] = useState(simSRTF.current);

  // --- BUCLE DE SIMULACIÓN ---
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        // VRR
        const arrVRR = pendingVRR.current.filter(p => p.arrivalTime === clock);
        pendingVRR.current = pendingVRR.current.filter(p => p.arrivalTime > clock);
        arrVRR.forEach(p => simVRR.current.readyQueue.push(p));
        vrrTick(simVRR.current, clock, 4);
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
      }, 1000); // 1 segundo por tick. El dev de UI puede cambiar esto a 100ms si lo quiere más rápido
    }
    return () => clearInterval(timer);
  }, [isPlaying, clock]);

  return (
      <>
        <h1>Simulador de Planificación</h1>

        <div className="controles">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "Pausar" : "Ejecutar Simulación"}
          </button>
          <p>Tick actual (Reloj): {clock}</p>
        </div>

        <hr />

        {/* --- RENDERIZADO BÁSICO DE VRR --- */}
        <div className="panel-vrr">
          <h2>Virtual Round Robin (VRR)</h2>
          <div><strong>CPU actual:</strong> {vrrResult.running ? vrrResult.running.pid : "Ninguno"}</div>
          <div><strong>Cola Ready:</strong> {vrrResult.readyQueue.map(p => p.pid).join(", ") || "Vacía"}</div>
          <div><strong>Cola Aux:</strong> {vrrResult.auxQueue.map(p => p.pid).join(", ") || "Vacía"}</div>

          <h3>Timeline (Orden de Ejecución)</h3>
          {formatTimeline(vrrResult.timeline).map((t, i) => (
              <div key={i}>
                {t.pid} | Inicio: {t.start} - Fin: {t.end}
              </div>
          ))}
        </div>

        <hr />

        {/* --- RENDERIZADO BÁSICO DE MLFQ --- */}
        <div className="panel-mlfq">
          <h2>Multi-Level Feedback Queue (MLFQ)</h2>
          <div><strong>CPU actual:</strong> {mlfqResult.running ? `${mlfqResult.running.pid} (Q${mlfqResult.running.queueLevel})` : "Ninguno"}</div>
          <div><strong>Cola 0:</strong> {mlfqResult.queues[0]?.map(p => p.pid).join(", ") || "Vacía"}</div>
          <div><strong>Cola 1:</strong> {mlfqResult.queues[1]?.map(p => p.pid).join(", ") || "Vacía"}</div>
          <div><strong>Cola 2:</strong> {mlfqResult.queues[2]?.map(p => p.pid).join(", ") || "Vacía"}</div>

          <h3>Timeline (Orden de Ejecución)</h3>
          {formatTimeline(mlfqResult.timeline).map((t, i) => (
              <div key={i}>
                {t.pid} | Inicio: {t.start} - Fin: {t.end}
              </div>
          ))}
        </div>

        <hr />

        {/* --- RENDERIZADO BÁSICO DE SRTF --- */}
        <div className="panel-srtf">
          <h2>Shortest Remaining Time First (SRTF)</h2>
          <div><strong>CPU actual:</strong> {srtfResult.running ? srtfResult.running.pid : "Ninguno"}</div>
          <div><strong>Cola Ready:</strong> {srtfResult.readyQueue.map(p => `${p.pid}(restan:${p.remainingTime})`).join(", ") || "Vacía"}</div>
          <div><strong>Terminados:</strong> {srtfResult.completed.map(p => p.pid).join(", ") || "Ninguno"}</div>

          <h3>Timeline (Orden de Ejecución)</h3>
          {formatTimeline(srtfResult.timeline).map((t, i) => (
              <div key={i}>
                {t.pid} | Inicio: {t.start} - Fin: {t.end}
              </div>
          ))}
        </div>
      </>
  );
}

export default App;