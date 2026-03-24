import React, { useState } from 'react';

const ConfigView = ({ processes, setProcesses, quantum, setQuantum, onStart }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        arrival: 0,
        burst: 5,
        ioRequestTime: ''
    });

    const openModal = () => {
        setFormData({
            id: `P${processes.length + 1}`,
            arrival: 0,
            burst: 5,
            ioRequestTime: ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const name = formData.id.trim();
        const arrival = parseInt(formData.arrival, 10);
        const burst = parseInt(formData.burst, 10);

        if (!name) return alert("El nombre es requerido");
        if (isNaN(arrival) || arrival < 0) return alert("Arrival inválido. Debe ser 0 o mayor.");
        if (isNaN(burst) || burst <= 0) return alert("Burst inválido. Debe ser mayor a 0.");

        let ioRequestTime = null;
        if (formData.ioRequestTime !== "") {
            ioRequestTime = parseInt(formData.ioRequestTime, 10);
            if (isNaN(ioRequestTime) || ioRequestTime <= 0 || ioRequestTime >= burst) {
                return alert(`I/O inválido. Debe ser un número entre 1 y ${burst - 1}`);
            }
        }

        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
        setProcesses([...processes, { id: name, arrival, burst, ioRequestTime, color: randomColor }]);
        closeModal();
    };

    // 1. SOLUCIÓN: Eliminamos el window.confirm para borrar directamente
    const deleteProcess = (id) => {
        setProcesses(processes.filter(p => p.id !== id));
    };

    const addRandomProcess = () => {
        const randomId = `P${processes.length + 1}`;
        const randomArrival = Math.floor(Math.random() * 15);
        const randomBurst = Math.floor(Math.random() * 10) + 2;
        const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;

        let ioRequestTime = null;
        if (Math.random() < 0.3 && randomBurst > 2) {
            ioRequestTime = Math.floor(Math.random() * (randomBurst - 2)) + 1;
        }
        setProcesses([...processes, { id: randomId, arrival: randomArrival, burst: randomBurst, ioRequestTime, color: randomColor }]);
    };

    return (
        <div className="layout-wrapper" style={{ position: 'relative' }}>
            <aside className="sidebar">
                <div className="robot-container">
                    <div className="robot-placeholder robot-img" style={{ height: '150px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem' }}>🤖</div>
                </div>
                <h1 className="title" style={{ fontSize: '2.5rem', fontWeight: '800' }}>RR <span style={{ color: 'var(--air-blue)' }}>vs</span> MLQ <span style={{ color: 'var(--air-blue)' }}>vs</span> SRTF</h1>
                <p style={{ color: 'var(--pink-lavender)', letterSpacing: '4px' }}>SIMULATOR</p>

                <div className="controls">
                    <div className="quantum" style={{ textAlign: 'left' }}>
                        <label style={{ fontSize: '1rem', color: '#B8C7E0', margin: 2, marginTop: 4 }}>QUANTUM</label>
                        <input type="number" value={quantum} onChange={(e) => setQuantum(parseInt(e.target.value) || 1)} className="custom-input" />
                    </div>
                    <div className='buttonsDiv'>
                        <button onClick={addRandomProcess} className="btn-secondary" style={{ border: '2px solid var(--pink-lavender)', background: 'none', color: 'var(--pink-lavender)', padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>GENERATE RANDOM</button>
                        <button onClick={onStart} className="btn-primary" style={{ padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold' }}>START SIMULATION</button>
                    </div>
                </div>
            </aside>

            <main className="process-panel">
                <h2 style={{ fontSize: '3rem', opacity: 0.9, color: '#EAF2FF', margin: '0 0 20px 0' }}>Processes</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', overflowY: 'auto', maxHeight: '60vh', paddingRight: '10px' }}>
                    {processes.map((p, index) => (
                        <div key={p.id} className="process-card" style={{ animationDelay: `${index * 0.1}s`, display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="color-box" style={{ backgroundColor: p.color, width: '50px', height: '50px', borderRadius: '12px', boxShadow: '0 5px 15px rgba(0,0,0,0.2)' }}></div>
                            <div style={{ flex: 1 }}>
                                <strong style={{ fontSize: '1.4rem', display: 'block', color: 'white' }}>{p.id}</strong>
                                <span style={{ color: '#B8C7E0', fontSize: '0.9rem' }}>
                                    Arr: {p.arrival}s | Burst: {p.burst}s
                                    {p.ioRequestTime && <><br /><span style={{ color: '#ff85c0' }}>⏳ I/O at tick {p.ioRequestTime}</span></>}
                                </span>
                            </div>
                            {/* 2. SOLUCIÓN: Botón de eliminar más limpio y moderno */}
                            <button
                                onClick={() => deleteProcess(p.id)}
                                style={{
                                    background: 'rgba(255, 77, 77, 0.1)',
                                    color: '#ff4d4d',
                                    border: '1px solid rgba(255, 77, 77, 0.3)',
                                    borderRadius: '10px',
                                    width: '35px',
                                    height: '35px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    fontSize: '1rem'
                                }}
                                title="Eliminar proceso"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={openModal} className="add-btn" style={{ marginTop: '20px', padding: '15px', borderRadius: '15px', cursor: 'pointer', fontWeight: 'bold', width: '100%', border: '2px dashed var(--air-blue)', background: 'transparent', color: '#EAF2FF', fontSize: '1.1rem' }}>+ ADD NEW PROCESS</button>
            </main>

            {isModalOpen && (
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#1E293B', padding: '30px', borderRadius: '20px', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ color: 'white', marginTop: 0, marginBottom: '20px', fontSize: '1.5rem' }}>Crete new process</h3>

                        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div>
                                <label style={{ color: '#B8C7E0', display: 'block', marginBottom: '5px' }}>Process's name:</label>
                                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} required />
                            </div>

                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ color: '#B8C7E0', display: 'block', marginBottom: '5px' }}>Arrival:</label>
                                    <input type="number" min="0" value={formData.arrival} onChange={e => setFormData({...formData, arrival: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} required />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ color: '#B8C7E0', display: 'block', marginBottom: '5px' }}>Burst:</label>
                                    <input type="number" min="1" value={formData.burst} onChange={e => setFormData({...formData, burst: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', boxSizing: 'border-box' }} required />
                                </div>
                            </div>

                            <div>
                                <label style={{ color: '#ff85c0', display: 'block', marginBottom: '5px' }}>I/O (Optional):</label>
                                <input type="number" min="1" value={formData.ioRequestTime} onChange={e => setFormData({...formData, ioRequestTime: e.target.value})} placeholder={`Ej. 2`} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'rgba(255,133,192,0.1)', color: 'white', boxSizing: 'border-box' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '15px' }}>
                                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '10px', border: 'none', background: 'var(--air-blue, #6ea8ff)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigView;