# CPU Scheduling Simulator - Manual de Usuario

Un simulador interactivo y educativo que compara visualmente el funcionamiento de tres algoritmos de planificación de procesos en sistemas operativos: **Virtual Round Robin (VRR)**, **Multilevel Feedback Queue (MLFQ)** y **Shortest Remaining Time First (SRTF)**.

---

## Tabla de Contenidos

1. [¿Qué es este simulador?](#-qué-es-este-simulador)
2. [Requisitos de Instalación](#-requisitos-de-instalación)
3. [Cómo Instalar](#-cómo-instalar)
4. [Guía de Usuario - Paso a Paso](#-guía-de-usuario---paso-a-paso)
5. [Los Tres Algoritmos Explicados](#-los-tres-algoritmos-explicados)
6. [Métricas de Desempeño](#-métricas-de-desempeño)
7. [Ejemplos Prácticos](#-ejemplos-prácticos)
8. [Solución de Problemas](#-solución-de-problemas)

---

## ¿Qué es este simulador?

El **CPU Scheduling Simulator** es una herramienta educativa interactiva que te permite:

**Crear procesos virtuales** con parámetros personalizables
**Ejecutar simulaciones** de tres algoritmos de planificación diferentes simultáneamente
**Visualizar en tiempo real** cómo cada algoritmo maneja los procesos
**Comparar resultados** mediante gráficos y métricas de desempeño
**Entender mejor** cómo funcionan los sistemas operativos modernos

---

## Requisitos de Instalación

Antes de instalar, asegúrate de tener:

- **Node.js** versión 16.0.0 o superior
  - Descarga desde: https://nodejs.org/
  - Verifica con: `node --version`

- **npm** versión 7.0.0 o superior (incluido con Node.js)
  - Verifica con: `npm --version`

- **Un navegador moderno** (Chrome, Firefox, Edge, Safari)

---

## Cómo Instalar

### Paso 1: Abrir Terminal/CMD

En Windows:
- Presiona `Win + R`
- Escribe `cmd` y presiona Enter

En Mac/Linux:
- Abre la terminal

### Paso 2: Navegar a la Carpeta

```bash
cd C:\co.edu.uptc.vtm\so\Simulator\simulador
```

### Paso 3: Instalar Dependencias

```bash
npm install
```

Este comando descargará las librerías necesarias (React, Vite, etc.)

### Paso 4: Iniciar el Servidor

```bash
npm run dev
```

Verás algo como:
```
VITE v7.3.1 ready in 300 ms

➜ Local:   http://localhost:5173/
```

### Paso 5: Abrir en Navegador

Abre tu navegador y ve a: **http://localhost:5173/**

---

## Guía de Usuario - Paso a Paso

### PANTALLA 1: CONFIGURACIÓN (Crear tu Escenario)

Aquí es donde defines qué procesos simularás.

#### Configurar el Quantum

En el panel izquierdo, verás un campo **QUANTUM**:

```
QUANTUM: [___4___]
```

**¿Qué es el Quantum?**
- Es el tiempo máximo que cada proceso puede ejecutarse en Round Robin
- Ejemplo: Si quantum=4, cada proceso corre máximo 4 unidades de tiempo, luego cede el CPU

**Valores recomendados:**
- Pequeño (2-4): Muchos cambios de contexto
- Medio (4-8): Balance
- Grande (10+): Pocos cambios de contexto

**Intenta:** Cambia a 2 y luego a 10 para ver diferencias

#### Agregar Procesos

Tienes dos opciones:

**OPCIÓN A - Agregar Manual:**

1. Haz clic en el botón **"+"** en la sección de procesos
2. Se abre un formulario con campos:
   - **ID:** Nombre del proceso (ej: P1, P2, P3)
   - **Arrival Time:** ¿Cuándo llega? (ej: 0, 2, 5)
   - **Burst Time:** ¿Cuánto CPU necesita? (ej: 5, 8, 10)
   - **I/O Request Time:** (Opcional) ¿Cuándo solicita I/O? (ej: 3)

3. Completa los campos:
   ```
   ID: P1
   Arrival Time: 0
   Burst Time: 8
   I/O Request Time: 4
   ```
   Significado: "Proceso P1 llega en t=0, necesita 8ms de CPU, y en el segundo 4 solicita I/O"

4. Haz clic en "AGREGAR"

**OPCIÓN B - Generar Aleatorio:**

1. Haz clic en **"GENERATE RANDOM"**
2. Se crea automáticamente un proceso con valores aleatorios
3. Repite cuantas veces quieras

#### Revisar tus Procesos

En la sección principal, verás las **tarjetas de proceso**:

- Puedes ver todos los parámetros
- Haz clic en la **X** roja para eliminar

#### 4Iniciar Simulación

Cuando tengas al menos 1 proceso:

1. Haz clic en **"START SIMULATION"** (botón rojo)
2. Se va a la siguiente pantalla automáticamente

---

### PANTALLA 2: SIMULACIÓN (Observa la Acción)

Aquí ves los tres algoritmos ejecutando tu escenario EN TIEMPO REAL.

#### Elementos de la Pantalla:

**Panel Izquierdo (Control)**

**Botones:**
- **PLAY**: Inicia o reanuda la simulación
- **PAUSE**: Pausa para analizar
- **FINISH**: Termina y ve a resultados

**Slider de Velocidad:**
- Arrastra izquierda = MÁS LENTO
- Arrastra derecha = MÁS RÁPIDO
- Útil para ver detalles o acelerar

#### Tres Paneles Principales:

Verás 3 paneles idénticos en layout, uno para cada algoritmo

**Cómo Leer la Gráfica Gantt:**

| Elemento | Significado |
|----------|-------------|
| Bloque azul "P1" | Proceso P1 ejecutándose |
| Sección IDLE gris | CPU sin hacer nada |
| Altura uniforme | 1 unidad de tiempo = 1 bloque |
| Números abajo | Escala de tiempo |

**¿Qué observar?**

1. **Diferencias en orden de ejecución**
   - VRR: Todos obtienen tiempo igual
   - MLFQ: Procesos rápidos primero
   - SRTF: Procesos cortos primero

2. **Cantidad de cambios de contexto**
   - Más líneas = más cambios
   - RR tiene muchos si quantum es pequeño

3. **Procesos en I/O**
   - Cuando un proceso solicita I/O, desaparece del Gantt
   - Otros pueden ejecutar mientras espera
   - Mejor uso de CPU

#### Controles Útiles:

| Acción | Propósito |
|--------|-----------|
| PAUSE | Detente en un momento para analizar |
| Cambiar velocidad | Si es muy rápido o muy lento |
| FINISH | Cuando hayas visto suficiente |

---

### PANTALLA 3: RESULTADOS (Analiza el Desempeño)

Después de hacer clic en FINISH, verás los resultados comparativos.

#### Métricas Principales:

1. **Wait Time (Tiempo de Espera)** 
   - Cuánto tiempo estuvo el proceso esperando en cola
   - MENOR = MEJOR
   - Fórmula: Completion - Arrival - Burst

2. **Turnaround Time (Tiempo de Retorno)**
   - Tiempo total desde que llega hasta que termina
   - MENOR = MEJOR
   - Fórmula: Completion - Arrival

3. **Response Time (Tiempo de Respuesta)**
   - Cuánto esperó antes de ejecutarse por primera vez
   - MENOR = MEJOR (especialmente en sistemas interactivos)
   - Fórmula: First Run - Arrival

4. **CPU Utilization (Utilización CPU)** 
   - % de tiempo que CPU estuvo activa
   - MAYOR = MEJOR
   - Fórmula: (Tiempo útil / Tiempo total) × 100

5. **Throughput (Rendimiento)**
   - Cuántos procesos se completan por unidad de tiempo
   - MAYOR = MEJOR
   - Fórmula: Procesos completados / Tiempo total

#### Gráfico Radar:

El gráfico muestra 5 ejes:
- Cada algoritmo es una forma diferente
- **Área grande** = mejor desempeño general
- Compara visualmente todos los algoritmos

#### Botón BACK:

Regresa a la pantalla de CONFIGURACIÓN para:
- Cambiar quantum
- Agregar/quitar procesos
- Hacer una nueva simulación

---

## Los Tres Algoritmos Explicados

### VIRTUAL ROUND ROBIN (VRR)

**¿Qué es?**
Cada proceso obtiene un "turno" de tiempo (quantum). Si no termina, va al final de la cola.

**Características:**
Justo - todos obtienen tiempo igual
Buen tiempo de respuesta
Predecible
No es óptimo para tiempo de espera total

**Cuándo usar:**
- Sistemas interactivos
- Cuando necesitas que todos tengan respuesta rápida
- Multiusuario (todos obtienen CPU)

**Controla:**
- Quantum pequeño → respuesta rápida, muchos cambios
- Quantum grande → menos cambios, pero espera más larga

---

### MULTILEVEL FEEDBACK QUEUE (MLFQ)

**¿Qué es?**
Múltiples colas de prioridades. Los procesos suben/bajan de nivel según su comportamiento.

**Niveles:**
- **Q0 (Alta Prioridad)**: Quantum=5, procesos interactivos
- **Q1 (Media)**: Quantum=10, procesos medios
- **Q2 (Baja)**: Quantum=20, procesos batch

**Ejemplo Visual:**

**Características:**
Adaptativo - se ajusta automáticamente
Balance entre interactivo y batch
Buena respuesta para usuarios
Eficiente para workloads mixtos
Más complejo

**Boost (Importante!):**
- Cada 50 unidades de tiempo, TODOS vuelven a Q0
- Evita inanición de procesos en Q2
- Da oportunidad a procesos old de ser evaluados nuevamente

**Cuándo usar:**
- Sistemas con mezcla de procesos
- Cuando hay usuarios interactivos Y batch
- Quieres adaptación automática

---

### SHORTEST REMAINING TIME FIRST (SRTF)

**¿Qué es?**
Siempre ejecuta el proceso con MENOR tiempo restante. Es preemptivo.

**Ejemplo Visual:**

**Características:**
MEJOR tiempo de espera promedio (óptimo)
Minimiza espera total del sistema
Requiere conocer tiempo por adelantado (impráctica)
Penaliza procesos largos (inanición posible)
Muchos cambios de contexto

**Preemptivo significa:**
- Si un proceso corto llega, interrumpe el actual
- Siempre elige el más corto

**Cuándo usar:**
- Ambiente de batch con tiempos conocidos
- Objetivo: minimizar espera promedio
- Educación/investigación

---

## Métricas de Desempeño

### Cálculo de Cada Métrica:

#### 1. Average Waiting Time
```
Para cada proceso:
  Waiting Time = Completion Time - Arrival Time - Burst Time

Promedio = Suma de Waiting Times / Cantidad de Procesos

Ejemplo:
  P1: Completion=8, Arrival=0, Burst=5 → Wait=3
  P2: Completion=10, Arrival=2, Burst=4 → Wait=4
  Promedio = (3+4)/2 = 3.5
```

#### 2. Average Turnaround Time
```
Para cada proceso:
  Turnaround = Completion Time - Arrival Time

Promedio = Suma / Cantidad

Ejemplo:
  P1: Comp=8, Arr=0 → Turn=8
  P2: Comp=10, Arr=2 → Turn=8
  Promedio = (8+8)/2 = 8
```

#### 3. Average Response Time
```
Para cada proceso:
  Response = First Run Time - Arrival Time

Promedio = Suma / Cantidad

Importante: Tiempo hasta PRIMERA ejecución
```

#### 4. CPU Utilization
```
% = (Tiempo de Ejecución Útil / Tiempo Total Simulación) × 100

Ejemplo:
  - P1 ejecutó: 5 unidades
  - P2 ejecutó: 4 unidades
  - Tiempo total: 12 unidades
  - Utilización = (5+4)/12 × 100 = 75%
  
Significado: CPU estuvo ocupada 75% del tiempo, 25% IDLE
```

#### 5. Throughput
```
Procesos completados por unidad de tiempo

= Número de Procesos Completados / Tiempo Total

Ejemplo:
  - 3 procesos completados
  - Tiempo total: 15 unidades
  - Throughput = 3/15 = 0.2 procesos/unidad
```

### Comparación Rápida:

| Métrica | Lo Ideal | Peor Escenario |
|---------|----------|---|
| Waiting Time | ↓ BAJO | ↑ Alto |
| Turnaround | ↓ BAJO | ↑ Alto |
| Response | ↓ BAJO (usuarios) | ↑ Alto |
| CPU Util | ↑ ALTO | ↓ Bajo (IDLE) |
| Throughput | ↑ ALTO | ↓ Bajo |

---

**Versión:** 1.0   
**Proyecto:** CPU Scheduling Simulator  
