import React from 'react';

const ResultsView = ({ statsVRR, statsMLFQ, statsSRTF }) => {
    const safeStats = (stats) => stats || { cpuUtil: '0.0', throughput: '0.000', avgTurnaround: '0.0', avgWait: '0.0', avgResponse: '0.0', fairness: '0.00' };

    const vrr = { ...safeStats(statsVRR), name: 'VRR', color: '#3b82f6' };
    const mlfq = { ...safeStats(statsMLFQ), name: 'MLFQ', color: '#10b981' };
    const srtf = { ...safeStats(statsSRTF), name: 'SRTF', color: '#ef4444' };

    const algorithms = [vrr, mlfq, srtf];
    const sortedAlgorithms = [...algorithms].sort((a, b) => parseFloat(a.avgWait) - parseFloat(b.avgWait));
    sortedAlgorithms.forEach((alg, index) => { alg.rank = index + 1; });

    // En el Dashboard: [2do Lugar] [Gráfico Radar] [1er Lugar] [3er Lugar]
    // Pero para mantener simetría visual usaremos un Flexbox equilibrado
    const maxWait = Math.max(...algorithms.map(a => parseFloat(a.avgWait))) || 1;
    const maxTurnaround = Math.max(...algorithms.map(a => parseFloat(a.avgTurnaround))) || 1;
    const maxResponse = Math.max(...algorithms.map(a => parseFloat(a.avgResponse))) || 1;
    const maxCPU = Math.max(...algorithms.map(a => parseFloat(a.cpuUtil))) || 1;
    const maxThrough = Math.max(...algorithms.map(a => parseFloat(a.throughput))) || 1;

    // --- LÓGICA DEL RADAR SVG ---
    const labels = ["Wait", "Resp", "Turn", "CPU", "Thr"];
    const centerX = 100, centerY = 100, radius = 70;
    
    const getPoint = (val, max, i, total) => {
        const factor = (parseFloat(val) / max) * radius;
        const angle = (Math.PI * 2 * i) / total - Math.PI / 2;
        return `${centerX + factor * Math.cos(angle)},${centerY + factor * Math.sin(angle)}`;
    };

    const renderRadar = () => (
        <div style={{ width: '350px', height: '350px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="100%" height="100%" viewBox="0 0 200 200">
                {/* Telaraña de fondo */}
                {[0.2, 0.4, 0.6, 0.8, 1].map(f => (
                    <polygon key={f} points={labels.map((_, i) => getPoint(f, 1, i, labels.length)).join(' ')} 
                    fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                ))}
                {/* Ejes */}
                {labels.map((_, i) => (
                    <line key={i} x1={centerX} y1={centerY} x2={getPoint(1, 1, i, labels.length).split(',')[0]} 
                    y2={getPoint(1, 1, i, labels.length).split(',')[1]} stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                ))}
                {/* Polígonos de Algoritmos */}
                {algorithms.map(alg => {
                    const pts = [
                        getPoint(alg.avgWait, maxWait, 0, 5),
                        getPoint(alg.avgResponse, maxResponse, 1, 5),
                        getPoint(alg.avgTurnaround, maxTurnaround, 2, 5),
                        getPoint(alg.cpuUtil, maxCPU, 3, 5),
                        getPoint(alg.throughput, maxThrough, 4, 5)
                    ].join(' ');
                    return <polygon key={alg.name} points={pts} fill={`${alg.color}33`} stroke={alg.color} strokeWidth="2" />;
                })}
            </svg>
            {/* Etiquetas flotantes */}
            {labels.map((l, i) => {
                const pos = getPoint(1.2, 1, i, labels.length).split(',');
                return <span key={l} style={{ position: 'absolute', left: `${pos[0]/2}%`, top: `${pos[1]/2}%`, fontSize: '0.6rem', color: '#94a3b8', transform: 'translate(-50%, -50%)' }}>{l}</span>;
            })}
        </div>
    );

    const StatBar = ({ label, value, val, max, color }) => (
        <div style={{ marginBottom: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.75rem', marginBottom: '2px' }}>
                <span>{label}</span>
                <strong style={{ color: 'white' }}>{value}</strong>
            </div>
            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', height: '4px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.max((parseFloat(val)/max)*100, 2)}%`, backgroundColor: color, transition: 'width 1s ease-out' }} />
            </div>
        </div>
    );

    const renderCard = (alg, mini = false) => {
        const isWinner = alg.rank === 1;
        return (
            <div key={alg.name} style={{
                backgroundColor: '#1e293b', padding: '20px', borderRadius: '20px',
                border: `1px solid ${isWinner ? alg.color : 'rgba(255,255,255,0.1)'}`,
                width: mini ? '280px' : '320px', height: 'fit-content', position: 'relative',
                boxShadow: isWinner ? `0 10px 40px ${alg.color}22` : '0 5px 15px rgba(0,0,0,0.2)',
            }}>
                <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#0f172a', color: isWinner ? '#fbbf24' : '#cbd5e1', padding: '2px 10px', borderRadius: '8px', border: '1px solid currentColor', fontSize: '0.6rem', fontWeight: 'bold' }}>
                    {alg.rank === 1 ? '🏆 WINNER' : `${alg.rank}º PLACE`}
                </div>
                <h2 style={{ color: alg.color, textAlign: 'center', margin: '5px 0 15px 0', fontSize: '1.2rem' }}>{alg.name}</h2>
                <StatBar label="Wait" value={alg.avgWait} val={alg.avgWait} max={maxWait} color={alg.color} />
                <StatBar label="Turn" value={alg.avgTurnaround} val={alg.avgTurnaround} max={maxTurnaround} color={alg.color} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '0.6rem' }}>CPU</div>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>{alg.cpuUtil}%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '0.6rem' }}>THR</div>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: '0.8rem' }}>{alg.throughput}</div>
                    </div>
                </div>
            </div>
        );
    };

    // ... (mantenemos la lógica de safeStats y sortedAlgorithms)

return (
    <div style={{ 
        width: '100vw', height: '100vh', 
        display: 'flex', flexDirection: 'column', 
        padding: '20px 50px', boxSizing: 'border-box',
        overflow: 'hidden' 
    }}>
        {/* HEADER COMPACTO */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '15px' }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: '1000', margin: 0 }}>RESULTS</h1>
            <button onClick={() => window.location.reload()} style={{ padding: '6px 15px', backgroundColor: '#3b82f6', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '1rem' }}>NEW SIMULATION</button>
        </header>


        {/* ZONA INFERIOR: EL PODIO (3 Columnas) */}
        <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr 1fr', 
            gap: '30px', 
            alignItems: 'end', // Alineados a la base
            paddingBottom: '20px'
        }}>
            
            {/* LADO IZQUIERDO: 2do LUGAR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderCard(sortedAlgorithms[1], true)}
            </div>

            {/* CENTRO: GANADOR + RADAR PEQUEÑO */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <div style={{ transform: 'scale(0.8)', margin: '-50px 0' }}>
                    {renderRadar()}
                </div>
                <div style={{ transform: 'scale(1.05)', zIndex: 10 }}>
                    {renderCard(sortedAlgorithms[0])}
                </div>
            </div>

            {/* LADO DERECHO: 3er LUGAR */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {renderCard(sortedAlgorithms[2], true)}
            </div>

        </div>
    </div>
);
};

export default ResultsView;