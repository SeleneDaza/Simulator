import React, { useState } from 'react';
import './ConfigView.css';

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
        <div className="layout-wrapper">
            <aside className="sidebar config-sidebar">
                <div className="robot-container">
                    <div className="robot-placeholder robot-img">🤖</div>
                </div>
                <h1 className="title">RR <span>vs</span> MLFQ <span>vs</span> SRTF</h1>
                <p className="config-subtitle">SIMULATOR</p>

                <div className="controls">
                    <div className="quantum">
                        <label>QUANTUM</label>
                        <input type="number" value={quantum} onChange={(e) => setQuantum(parseInt(e.target.value) || 1)} className="custom-input" />
                    </div>
                    <div className='btn-group'>
                        <button onClick={addRandomProcess} className="btn-secondary">GENERATE RANDOM</button>
                        <button onClick={onStart} className="btn-primary">START SIMULATION</button>
                    </div>
                </div>
            </aside>

            <main className="process-panel">
                <h2>Processes</h2>
                <div className="process-grid">
                    {processes.map((p, index) => (
                        <div key={p.id} className="process-card process-item" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="color-box" style={{ backgroundColor: p.color }}></div>
                            <div className="process-info">
                                <strong className="process-name">{p.id}</strong>
                                <span className="process-details">
                                    Arr: {p.arrival}s | Burst: {p.burst}s
                                    {p.ioRequestTime && <><br /><span className="process-details io">⏳ I/O at tick {p.ioRequestTime}</span></>}
                                </span>
                            </div>

                            <button
                                onClick={() => deleteProcess(p.id)}
                                className="delete-process-btn"
                                title="Delete process"
                            >
                                🗑️
                            </button>
                        </div>
                    ))}
                </div>
                <button onClick={openModal} className="add-btn add-process-btn">+ ADD NEW PROCESS</button>
            </main>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3 className="modal-title">Create New Process</h3>

                        <form onSubmit={handleFormSubmit} className="modal-form">
                            <div className="form-group">
                                <label>Process's name:</label>
                                <input type="text" value={formData.id} onChange={e => setFormData({...formData, id: e.target.value})} required />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Arrival:</label>
                                    <input type="number" min="0" value={formData.arrival} onChange={e => setFormData({...formData, arrival: e.target.value})} required />
                                </div>
                                <div className="form-group">
                                    <label>Burst:</label>
                                    <input type="number" min="1" value={formData.burst} onChange={e => setFormData({...formData, burst: e.target.value})} required />
                                </div>
                            </div>

                            <div className="form-group io-input">
                                <label>I/O (Optional):</label>
                                <input type="number" min="1" value={formData.ioRequestTime} onChange={e => setFormData({...formData, ioRequestTime: e.target.value})} placeholder="Ex. 2" />
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={closeModal} className="btn-cancel">Cancel</button>
                                <button type="submit" className="btn-submit">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConfigView;