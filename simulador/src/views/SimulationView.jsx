import React from 'react';

// --- COMPONENTES VISUALES INTERNOS ---
const formatTimeline = (timelineArray) => {
    const blocks = [];
    let current = null;
    timelineArray.forEach((pid, index) => {
        if (!current || current.pid !== pid) {
            if (current) { current.end = index; blocks.push(current); }
            current = { pid, start: index, end: index + 1 };
        } else { current.end = index + 1; }
    });
    if (current && !blocks.includes(current)) blocks.push(current);
    return blocks;
};

const QueueBadge = ({ pid, processes }) => {
    const processData = processes.find(p => p.id === pid);
    const bgColor = processData ? processData.color : '#555';
    return (
        <span style={{ backgroundColor: bgColor, color: '#fff', padding: '4px 10px', borderRadius: '6px', marginRight: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
      {pid}
    </span>
    );
};

const GanttChart = ({ timeline, processes }) => {
    if (timeline.length === 0) return <div style={{ color: '#888' }}>Esperando ejecución...</div>;
    const totalTime = timeline[timeline.length - 1].end;
    if (totalTime === 0) return <div style={{ color: '#888' }}>Sin datos...</div>;

    return (
        <div style={{ position: 'relative', width: '100%', overflow: 'visible', marginBottom: '35px' }}>
            <h4 style={{margin: '0 0 10px 0', color: '#b8c7e0', fontSize: '0.9rem', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '1px'}}>Gantt Chart</h4>
            <div style={{ display: 'flex', height: '40px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden', border: '2px solid black' }}>
                {timeline.map((block, i) => {
                    const duration = block.end - block.start;
                    const processData = processes.find(p => p.id === block.pid);
                    const bgColor = processData ? processData.color : 'transparent';
                    const isIdle = block.pid === 'IDLE';

                    return (
                        <div key={i} style={{ flex: duration, backgroundColor: bgColor, borderLeft: (i > 0 ? '2px solid black' : 'none'), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: isIdle ? '#666' : '#fff', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {!isIdle && <span style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{block.pid.toLowerCase()}</span>}
                        </div>
                    );
                })}
            </div>
            {timeline.map((block, i) => (
                <div key={`time-${i}`} style={{ position: 'absolute', left: `${(block.end / totalTime) * 100}%`, transform: 'translateX(-50%)', top: '100%', marginTop: '5px', fontSize: '0.8rem', color: '#fff' }}>{block.end}</div>
            ))}
            <div style={{ position: 'absolute', left: '0%', transform: 'translateX(-50%)', top: '100%', marginTop: '5px', fontSize: '0.8rem', color: '#fff' }}>0</div>
        </div>
    );
};

// --- VISTA PRINCIPAL ---
const SimulationView = ({ processes, quantum, clock, isPlaying, setIsPlaying, vrrResult, mlfqResult, srtfResult, onFinish }) => {
    return (
        <div style={{ padding: '20px', color: 'white', width: '100vw', height: '100vh', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h1 style={{ margin: 0, fontSize: '2rem' }}>Dashboard de Simulación</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isPlaying ? "⏸ Pausar" : "▶️ Reproducir"}
                    </button>
                    <button onClick={onFinish} style={{ padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#e83e8c', color: 'white', border: 'none' }}>
                        Finalizar y Ver Resultados
                    </button>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ff85c0' }}>⏰ Tick actual: {clock}</span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', flex: 1 }}>

                {/* PANEL VRR */}
                <div style={{ flex: 1, border: '1px solid #444', padding: '15px 20px', borderRadius: '12px', backgroundColor: '#131a2d', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ color: '#007bff', margin: '0 0 10px 0', fontSize: '1.3rem' }}>Virtual Round Robin (Q={quantum})</h2>
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '10px' }}>
                        <div><strong>💻 CPU:</strong> {vrrResult.running ? <QueueBadge pid={vrrResult.running.pid} processes={processes} /> : "IDLE"}</div>
                        <div><strong>🟢 Cola Ready:</strong> {vrrResult.readyQueue.length > 0 ? vrrResult.readyQueue.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
                        <div><strong>⏳ Cola I/O:</strong> {vrrResult.ioList.length > 0 ? vrrResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}><GanttChart timeline={formatTimeline(vrrResult.timeline)} processes={processes} /></div>
                </div>

                {/* PANEL MLFQ */}
                <div style={{ flex: 1, border: '1px solid #444', padding: '15px 20px', borderRadius: '12px', backgroundColor: '#131a2d', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ color: '#28a745', margin: '0 0 10px 0', fontSize: '1.3rem' }}>MLFQ</h2>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '10px' }}>
                        <div><strong>💻 CPU:</strong> {mlfqResult.running ? <QueueBadge pid={mlfqResult.running.pid} processes={processes} /> : "IDLE"}</div>
                        <div><strong>🥇 Cola 0:</strong> {mlfqResult.queues[0]?.length > 0 ? mlfqResult.queues[0].map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
                        <div><strong>🥈 Cola 1:</strong> {mlfqResult.queues[1]?.length > 0 ? mlfqResult.queues[1].map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
                        <div><strong>🥉 Cola 2:</strong> {mlfqResult.queues[2]?.length > 0 ? mlfqResult.queues[2].map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
                        <div><strong>⏳ Cola I/O:</strong> {mlfqResult.ioList.length > 0 ? mlfqResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}><GanttChart timeline={formatTimeline(mlfqResult.timeline)} processes={processes} /></div>
                </div>

                {/* PANEL SRTF */}
                <div style={{ flex: 1, border: '1px solid #444', padding: '15px 20px', borderRadius: '12px', backgroundColor: '#131a2d', display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ color: '#dc3545', margin: '0 0 10px 0', fontSize: '1.3rem' }}>SRTF</h2>
                    <div style={{ display: 'flex', gap: '30px', marginBottom: '10px' }}>
                        <div><strong>💻 CPU:</strong> {srtfResult.running ? <QueueBadge pid={srtfResult.running.pid} processes={processes} /> : "IDLE"}</div>
                        <div><strong>🟢 Cola Ready:</strong> {srtfResult.readyQueue.length > 0 ? srtfResult.readyQueue.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
                        <div><strong>⏳ Cola I/O:</strong> {srtfResult.ioList.length > 0 ? srtfResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />) : <span style={{opacity: 0.5}}>Vacía</span>}</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start' }}><GanttChart timeline={formatTimeline(srtfResult.timeline)} processes={processes} /></div>
                </div>

            </div>
        </div>
    );
};

export default SimulationView;