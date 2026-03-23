import React, { useState } from 'react';

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
        <span style={{
            backgroundColor: bgColor,
            color: '#fff',
            padding: '4px 10px',
            borderRadius: '6px',
            marginRight: '6px',
            marginBottom: '4px',
            fontWeight: 'bold',
            display: 'inline-block'
        }}>
            {pid}
        </span>
    );
};

const GanttChart = ({ timeline, processes }) => {
    if (timeline.length === 0) return <div style={{ color: '#888' }}>Waiting ejecution...</div>;
    const totalTime = timeline[timeline.length - 1].end;
    if (totalTime === 0) return <div style={{ color: '#888' }}>No data found...</div>;

    return (
        <div style={{ position: 'relative', width: '100%', marginBottom: '25px' }}>
            <div style={{
                display: 'flex',
                height: '40px',
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '2px solid black'
            }}>
                {timeline.map((block, i) => {
                    const duration = block.end - block.start;
                    const processData = processes.find(p => p.id === block.pid);
                    const bgColor = processData ? processData.color : 'transparent';
                    const isIdle = block.pid === 'IDLE';

                    return (
                        <div key={i} style={{
                            flex: duration,
                            backgroundColor: bgColor,
                            borderLeft: (i > 0 ? '2px solid black' : 'none'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: isIdle ? '#666' : '#fff',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {!isIdle && block.pid.toLowerCase()}
                        </div>
                    );
                })}
            </div>

            {timeline.map((block, i) => (
                <div key={i} style={{
                    position: 'absolute',
                    left: `${(block.end / totalTime) * 100}%`,
                    transform: 'translateX(-50%)',
                    top: '100%',
                    fontSize: '0.7rem'
                }}>
                    {block.end}
                </div>
            ))}
        </div>
    );
};

// --- COMPONENTE HOVER INFO ---
const HoverInfo = ({ children }) => (
    <div style={{
        position: 'absolute',
        top: '35px',
        left: '0',
        background: '#1c2540',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        zIndex: 10,
        minWidth: '250px'
    }}>
        {children}
    </div>
);

// --- VISTA PRINCIPAL ---
const SimulationView = ({
    processes,
    quantum,
    clock,
    isPlaying,
    setIsPlaying,
    vrrResult,
    mlfqResult,
    srtfResult,
    onFinish
}) => {

    const [hovered, setHovered] = useState(null);

    return (
        <div style={{
            display: 'flex',
            width: '100vw',
            height: '100vh',
            backgroundColor: '#0b1020',
            color: 'white',
            overflow: 'hidden'
        }}>

            {/* --- PANEL IZQUIERDO --- */}
            <div style={{
                width: '260px',
                padding: '20px',
                borderRight: '1px solid #222',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                backgroundColor: '#0f1630'
            }}>
                <div>
                    <h2 style={{ marginBottom: '10px' }}>Simulation</h2>

                    <img
                        src="/robot.png"
                        alt="robot"
                        style={{
                            width: '100%',
                            marginBottom: '20px',
                            borderRadius: '10px',
                            opacity: 0.9
                        }}
                    />

                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        style={{
                            width: '100%',
                            padding: '10px',
                            marginBottom: '10px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        {isPlaying ? "⏸ PAUSE" : "▶️ START"}
                    </button>

                    <button
                        onClick={onFinish}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            backgroundColor: '#e83e8c',
                            color: 'white',
                            border: 'none'
                        }}
                    >
                        FINISH
                    </button>
                </div>

                <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ff85c0'
                }}>
                    ⏰ {clock}
                </div>
            </div>

            {/* --- PANEL DERECHO --- */}
            <div style={{
                flex: 1,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                overflow: 'hidden'
            }}>

                {/* VRR */}
                <div
                    onMouseEnter={() => setHovered('vrr')}
                    onMouseLeave={() => setHovered(null)}
                    style={{ flex: 1, backgroundColor: '#131a2d', padding: '15px', borderRadius: '12px', position: 'relative' }}
                >
                    <h2 style={{ color: '#007bff', cursor: 'pointer' }}>
                        Virtual Round Robin
                    </h2>

                    {hovered === 'vrr' && (
                        <HoverInfo>
                            <div><strong>Quantum:</strong> {quantum}</div>
                            <div><strong>CPU:</strong> {vrrResult.running ? <QueueBadge pid={vrrResult.running.pid} processes={processes} /> : "IDLE"}</div>
                            <div><strong>Ready:</strong> {vrrResult.readyQueue.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                            <div><strong>I/O:</strong> {vrrResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                        </HoverInfo>
                    )}

                    <GanttChart timeline={formatTimeline(vrrResult.timeline)} processes={processes} />
                </div>

                {/* MLFQ */}
                <div
                    onMouseEnter={() => setHovered('mlfq')}
                    onMouseLeave={() => setHovered(null)}
                    style={{ flex: 1, backgroundColor: '#131a2d', padding: '15px', borderRadius: '12px', position: 'relative' }}
                >
                    <h2 style={{ color: '#28a745', cursor: 'pointer' }}>
                        MLFQ
                    </h2>

                    {hovered === 'mlfq' && (
                        <HoverInfo>
                            <div><strong>CPU:</strong> {mlfqResult.running ? <QueueBadge pid={mlfqResult.running.pid} processes={processes} /> : "IDLE"}</div>
                            {mlfqResult.queues.map((q, i) => (
                                <div key={i}><strong>Cola {i}:</strong> {q.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                            ))}
                        </HoverInfo>
                    )}

                    <GanttChart timeline={formatTimeline(mlfqResult.timeline)} processes={processes} />
                </div>

                {/* SRTF */}
                <div
                    onMouseEnter={() => setHovered('srtf')}
                    onMouseLeave={() => setHovered(null)}
                    style={{ flex: 1, backgroundColor: '#131a2d', padding: '15px', borderRadius: '12px', position: 'relative' }}
                >
                    <h2 style={{ color: '#dc3545', cursor: 'pointer' }}>
                        SRTF
                    </h2>

                    {hovered === 'srtf' && (
                        <HoverInfo>
                            <div><strong>CPU:</strong> {srtfResult.running ? <QueueBadge pid={srtfResult.running.pid} processes={processes} /> : "IDLE"}</div>
                            <div><strong>Ready:</strong> {srtfResult.readyQueue.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                            <div><strong>I/O:</strong> {srtfResult.ioList.map(p => <QueueBadge key={p.pid} pid={p.pid} processes={processes} />)}</div>
                        </HoverInfo>
                    )}

                    <GanttChart timeline={formatTimeline(srtfResult.timeline)} processes={processes} />
                </div>

            </div>
        </div>
    );
};

export default SimulationView;