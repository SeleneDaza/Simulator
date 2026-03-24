import React from 'react';

const ResultsView = ({ statsVRR, statsMLFQ, statsSRTF }) => {
    const statRow = { display: 'flex', flexDirection: 'column', marginBottom: '15px' };
    const labelStyle = { display: 'flex', justifyContent: 'space-between', color: '#B8C7E0', fontSize: '0.9rem', marginBottom: '5px' };

    // Helper de seguridad
    const safeStats = (stats) => stats || { cpuUtil: '0.0', throughput: '0.000', avgTurnaround: '0.0', avgWait: '0.0', avgResponse: '0.0', fairness: '0.00' };

    const vrr = { ...safeStats(statsVRR), name: 'Virtual Round Robin', color: '#007bff' };
    const mlfq = { ...safeStats(statsMLFQ), name: 'MLFQ', color: '#28a745' };
    const srtf = { ...safeStats(statsSRTF), name: 'SRTF', color: '#dc3545' };

    // 1. Evaluar y ordenar por menor Wait Time Promedio
    const algorithms = [vrr, mlfq, srtf];
    const sortedAlgorithms = [...algorithms].sort((a, b) => parseFloat(a.avgWait) - parseFloat(b.avgWait));

    // Asignar el rango (rank) a cada algoritmo
    sortedAlgorithms.forEach((alg, index) => {
        alg.rank = index + 1;
    });

    // 2. Reordenar para el efecto visual de Podio: [Izquierda: 2do, Centro: 1ro, Derecha: 3ro]
    const podiumOrder = [
        sortedAlgorithms[1], // 2do Lugar (Izquierda)
        sortedAlgorithms[0], // 1er Lugar (Centro)
        sortedAlgorithms[2]  // 3er Lugar (Derecha)
    ].filter(Boolean);

    const getBadge = (rank) => {
        if (rank === 1) return { icon: '🥇', label: '1er Lugar', color: '#FFD700', bg: 'rgba(255, 215, 0, 0.15)' };
        if (rank === 2) return { icon: '🥈', label: '2do Lugar', color: '#E0E0E0', bg: 'rgba(224, 224, 224, 0.15)' };
        return { icon: '🥉', label: '3er Lugar', color: '#CD7F32', bg: 'rgba(205, 127, 50, 0.15)' };
    };

    const getBarWidth = (val, maxVal) => {
        const num = parseFloat(val);
        const max = parseFloat(maxVal);
        if (max === 0 || isNaN(num) || isNaN(max)) return '0%';
        return `${(num / max) * 100}%`;
    };

    const maxWait = Math.max(...algorithms.map(a => parseFloat(a.avgWait)));
    const maxTurnaround = Math.max(...algorithms.map(a => parseFloat(a.avgTurnaround)));
    const maxResponse = Math.max(...algorithms.map(a => parseFloat(a.avgResponse)));

    const StatBar = ({ label, value, unit, color, barWidth, isWinner }) => (
        <div style={statRow}>
            <div style={labelStyle}>
                <span>{label}</span>
                <strong style={{ color: 'white' }}>{value}{unit}</strong>
            </div>
            <div style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '5px', height: '8px', overflow: 'hidden' }}>
                <div style={{
                    height: '100%',
                    width: barWidth,
                    backgroundColor: color,
                    borderRadius: '5px',
                    transition: 'width 1s ease-in-out',
                    opacity: isWinner ? 1 : 0.7
                }}></div>
            </div>
        </div>
    );

    const renderCard = (alg) => {
        const badge = getBadge(alg.rank);

        // 3. Estilos dinámicos para acentuar el podio
        let transformStyle = 'scale(1)';
        let boxShadowStyle = '0 10px 30px rgba(0,0,0,0.3)';
        let zIndexStyle = 1;

        if (alg.rank === 1) {
            transformStyle = 'scale(1.1) translateY(-25px)'; // Más grande y más alto
            boxShadowStyle = `0 15px 50px ${alg.color}40`; // Brillo más fuerte
            zIndexStyle = 10;
        } else if (alg.rank === 2) {
            transformStyle = 'scale(0.95) translateY(15px)'; // Un poco más pequeño y bajo
            zIndexStyle = 5;
        } else if (alg.rank === 3) {
            transformStyle = 'scale(0.85) translateY(45px)'; // El más pequeño y bajo
            zIndexStyle = 4;
        }

        return (
            <div
                key={alg.name}
                style={{
                    backgroundColor: '#131a2d',
                    padding: '25px',
                    borderRadius: '15px',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderTop: `4px solid ${alg.color}`,
                    flex: 1,
                    minWidth: '280px',
                    maxWidth: '350px',
                    position: 'relative',
                    transition: 'all 0.5s ease',
                    transform: transformStyle,
                    boxShadow: boxShadowStyle,
                    zIndex: zIndexStyle
                }}
            >
                {/* Etiqueta del Podio centrada */}
                <div style={{
                    position: 'absolute', top: '-18px', left: '50%', transform: 'translateX(-50%)',
                    backgroundColor: badge.bg, color: badge.color,
                    padding: '5px 20px', borderRadius: '20px',
                    fontWeight: 'bold', fontSize: '1rem', border: `1px solid ${badge.color}`,
                    display: 'flex', alignItems: 'center', gap: '8px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap'
                }}>
                    <span style={{ fontSize: '1.4rem' }}>{badge.icon}</span> {badge.label}
                </div>

                <h2 style={{ color: alg.color, textAlign: 'center', marginTop: '15px', marginBottom: '25px', fontSize: '1.8rem' }}>{alg.name}</h2>

                <StatBar label="T. Espera Prom (Wait):" value={alg.avgWait} unit="s" color={alg.color} barWidth={getBarWidth(alg.avgWait, maxWait)} isWinner={alg.rank === 1} />
                <StatBar label="T. Respuesta Prom:" value={alg.avgResponse} unit="s" color={alg.color} barWidth={getBarWidth(alg.avgResponse, maxResponse)} />
                <StatBar label="T. Terminación Prom:" value={alg.avgTurnaround} unit="s" color={alg.color} barWidth={getBarWidth(alg.avgTurnaround, maxTurnaround)} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                        <span style={{ display: 'block', color: '#B8C7E0', fontSize: '0.8rem' }}>CPU Utilización</span>
                        <strong style={{ color: 'white' }}>{alg.cpuUtil}%</strong>
                    </div>
                    <div>
                        <span style={{ display: 'block', color: '#B8C7E0', fontSize: '0.8rem' }}>Throughput</span>
                        <strong style={{ color: 'white' }}>{alg.throughput} p/t</strong>
                    </div>
                    <div style={{ gridColumn: 'span 2', marginTop: '5px' }}>
                        <span style={{ display: 'block', color: '#B8C7E0', fontSize: '0.8rem' }}>Fairness (Desv. Wait)</span>
                        <strong style={{ color: 'white' }}>{alg.fairness}</strong>
                    </div>
                </div>
            </div>
        );
    };

    return (
        // Contenedor principal para centrar todo en la pantalla
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '40px',
            boxSizing: 'border-box'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '60px' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '2.5rem', color: 'white' }}>Resultados de Simulación</h1>
                        <p style={{ color: '#B8C7E0', margin: '5px 0 0 0' }}>El podio se define por el menor <strong>Tiempo de Espera Promedio</strong>.</p>
                    </div>
                    <button onClick={() => window.location.reload()} style={{ padding: '12px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: '#6ea8ff', color: 'white', border: 'none', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(110, 168, 255, 0.4)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.target.style.transform = 'scale(1)'}>
                        NUEVA SIMULACIÓN
                    </button>
                </div>

                {/* Contenedor del Podio */}
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', marginTop: '30px', paddingBottom: '40px' }}>
                    {podiumOrder.map(alg => renderCard(alg))}
                </div>
            </div>
        </div>
    );
};

export default ResultsView;