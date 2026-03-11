
import { Process } from './src/models/Process.js';
import { vrrTick } from './src/algorithms/roundRobin.js';

// Setup simulado
const QUANTUM = 4;
let clock = 0;
// Estado inicial dummy
let state = {
    readyQueue: [],
    auxQueue: [], // VRR specific
    running: null,
    completed: [],
    ioList: []
};

// Crear procesos
// Process 1: Burst 10, no IO
const p1 = new Process({ pid: 'P1', arrivalTime: 0, burstTime: 10 });
// Process 2: Burst 6, IO request at t=2 (exec time), IO duration 4
const p2 = new Process({ pid: 'P2', arrivalTime: 0, burstTime: 6, ioRequestTime: 2, ioBurst: 4 });

state.readyQueue.push(p1);
state.readyQueue.push(p2);

console.log("=== INICIO SIMULACION VRR (TEST TEMPORAL) ===");
console.log(`Quantum: ${QUANTUM}`);
console.log(`Procesos: P1 (Burst 10), P2 (Burst 6, IO en t=2 dur 4)`);

// Simular 25 Ticks
for (let i = 0; i < 25; i++) {
    clock = i;
    console.log(`\n--- Tick ${clock} ---`);
    
    // IMPORTANTE: En la app real usaremos structuredClone, aquí pasamos ref directa por simplicidad del test
    state = vrrTick(state, clock, QUANTUM);
    
    // Loguear estado
    const runningId = state.running ? `${state.running.pid} (rem:${state.running.remainingTime}, q:${state.running.quantumUsed})` : 'IDLE';
    const readyIds = state.readyQueue.map(p => p.pid).join(', ');
    const auxIds = state.auxQueue.map(p => p.pid).join(', '); // VRR
    const ioIds = state.ioList.map(p => `${p.pid}(ioRem:${p.ioRemaining})`).join(', ');
    const doneIds = state.completed.map(p => p.pid).join(', ');

    console.log(`CPU: [ ${runningId} ]`);
    console.log(`Ready: [ ${readyIds} ]`);
    console.log(`Aux(High): [ ${auxIds} ]`);
    console.log(`IO: [ ${ioIds} ]`);
    console.log(`Done: [ ${doneIds} ]`);

    if(state.completed.length === 2) {
        console.log("\nTODOS TERMINADOS!");
        break;
    }
}

