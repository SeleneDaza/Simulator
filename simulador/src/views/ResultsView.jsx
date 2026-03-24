import React from 'react';

const ResultsView = ({ statsVRR, statsMLFQ, statsSRTF }) => {
    const safeStats = (stats) => stats || { cpuUtil: '0.0', throughput: '0.000', avgTurnaround: '0.0', avgWait: '0.0', avgResponse: '0.0', fairness: '0.00' };

    const vrr = { ...safeStats(statsVRR), name: 'Virtual Round Robin', color: '#3b82f6' };
    const mlfq = { ...safeStats(statsMLFQ), name: 'MLFQ', color: '#10b981' };
    const srtf = { ...safeStats(statsSRTF), name: 'SRTF', color: '#ef4444' };

    const algorithms = [vrr, mlfq, srtf];
    const sortedAlgorithms = [...algorithms].sort((a, b) => parseFloat(a.avgWait) - parseFloat(b.avgWait));
    sortedAlgorithms.forEach((alg, index) => { alg.rank = index + 1; });

    // Orden para que el ganador quede al centro: [2do, 1ro, 3ro]
    const podiumOrder = [sortedAlgorithms[1], sortedAlgorithms[0], sortedAlgorithms[2]].filter(Boolean);

    const maxWait = Math.max(...algorithms.map(a => parseFloat(a.avgWait))) || 1;
    const maxTurnaround = Math.max(...algorithms.map(a => parseFloat(a.avgTurnaround))) || 1;
    const maxResponse = Math.max(...algorithms.map(a => parseFloat(a.avgResponse))) || 1;

    const StatBar = ({ label, value, val, max, color }) => (
        <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '4px' }}>
                <span>{label}</span>
                <strong style={{ color: 'white' }}>{value}s</strong>
            </div>
            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', height: '6px', overflow: 'hidden' }}>
                <div style={{ 
                    height: '100%', 
                    width: `${Math.max((parseFloat(val)/max)*100, 2)}%`, 
                    backgroundColor: color, 
                    transition: 'width 1s ease-out'
                }} />
            </div>
        </div>
    );

    const renderCard = (alg) => {
        const isWinner = alg.rank === 1;
        // Ajuste de posición: el 1ro no tiene margen, los otros bajan
        const offset = alg.rank === 1 ? '0px' : alg.rank === 2 ? '50px' : '100px';

        return (
            <div key={alg.name} style={{
                backgroundColor: '#1e293b',
                padding: '30px 20px',
                borderRadius: '20px',
                border: `1px solid ${isWinner ? alg.color : 'rgba(255,255,255,0.1)'}`,
                display: 'flex',
                flexDirection: 'column',
                height: 'fit-content',
                marginTop: offset,
                boxShadow: isWinner ? `0 10px 40px ${alg.color}33` : '0 10px 25px rgba(0,0,0,0.2)',
                position: 'relative',
                transition: 'all 0.3s ease'
            }}>
                <div style={{
                    position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: '#0f172a', color: isWinner ? '#fbbf24' : '#cbd5e1',
                    padding: '2px 14px', borderRadius: '10px', border: '1px solid currentColor',
                    fontSize: '0.7rem', fontWeight: 'bold', whiteSpace: 'nowrap'
                }}>
                    {alg.rank === 1 ? '🏆 1ST PLACE' : alg.rank === 2 ? '🥈 2ND PLACE' : '🥉 3RD PLACE'}
                </div>

                <h2 style={{ color: alg.color, textAlign: 'center', margin: '10px 0 25px 0', fontSize: '1.4rem' }}>{alg.name}</h2>

                <StatBar label="Wait Time" value={alg.avgWait} val={alg.avgWait} max={maxWait} color={alg.color} />
                <StatBar label="Response" value={alg.avgResponse} val={alg.avgResponse} max={maxResponse} color={alg.color} />
                <StatBar label="Turnaround" value={alg.avgTurnaround} val={alg.avgTurnaround} max={maxTurnaround} color={alg.color} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '0.65rem' }}>CPU UTIL</div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{alg.cpuUtil}%</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#64748b', fontSize: '0.65rem' }}>THROUGHPUT</div>
                        <div style={{ color: 'white', fontWeight: 'bold' }}>{alg.throughput}</div>
                    </div>
                </div>
            </div>
        );
    };

    // ... (mismo código de lógica arriba)

    return (
    <div style={{
        // Truco para ignorar al padre y ser 100% real
        width: '100vw',
        position: 'relative',
        left: '0%',
        
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
    }}>
        {/* Este div interno es el que controla que el contenido no se pegue a los bordes */}
        <div style={{ width: '90%', maxWidth: '1400px' }}>
            <header style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '80px',
                width: '100%'
            }}>
                <h1 style={{ color: 'white', margin: 0, fontSize: '2.5rem' }}>Resultados</h1>
                <button 
                    onClick={() => window.location.reload()} 
                    style={{
                        padding: '12px 24px', backgroundColor: '#3b82f6', color: 'white', 
                        border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer'
                    }}
                >NUEVA SIMULACIÓN</button>
            </header>

            <div style={{
                display: 'grid',
                // Las tarjetas se reparten el 100% del 90% del ancho
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '40px',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'start'
            }}>
                {podiumOrder.map(alg => renderCard(alg))}
            </div>
        </div>
    </div>
);
};

export default ResultsView;