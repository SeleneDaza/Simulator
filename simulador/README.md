# CPU Scheduling Simulator 🤖

Un simulador interactivo para comparar y analizar tres algoritmos populares de planificación de procesos en sistemas operativos.

## 📋 Tabla de Contenidos
- [Descripción](#descripción)
- [Características](#características)
- [Instalación](#instalación)
- [Uso](#uso)
- [Algoritmos Soportados](#algoritmos-soportados)
- [Manual de Usuario](#manual-de-usuario)
- [Métricas de Desempeño](#métricas-de-desempeño)

## 📖 Descripción

Este simulador permite crear procesos virtuales y comparar cómo tres diferentes algoritmos de planificación de CPU los ejecutan. Visualiza en tiempo real cómo cada algoritmo gestiona la cola de procesos listos, operaciones I/O y optimiza diferentes métricas de rendimiento.

**Perfecto para:** Estudiantes de sistemas operativos, profesionales que deseen entender scheduling, y educadores que necesiten herramientas didácticas interactivas.

## ✨ Características

- **3 Algoritmos de Planificación:** Round Robin (RR), Multilevel Feedback Queue (MLFQ), y Shortest Remaining Time First (SRTF)
- **Simulación en Tiempo Real:** Visualiza la ejecución de procesos con gráficas Gantt
- **Configuración Flexible:** Define procesos con tiempos de llegada, ráfagas de CPU e I/O personalizadas
- **Quantum Configurable:** Ajusta el quantum para Round Robin según tus necesidades
- **Generador Aleatorio:** Crea procesos automáticamente para pruebas rápidas
- **Comparación Visual:** Gráfico de radar con múltiples métricas de desempeño
- **Control de Velocidad:** Pausa, reanuda y ajusta la velocidad de simulación
- **Soporte I/O:** Los procesos pueden solicitar operaciones de entrada/salida durante su ejecución

## 🔧 Instalación

### Requisitos Previos
- Node.js v16.0.0 o superior
- npm v7.0.0 o superior

### Pasos de Instalación

```bash
# 1. Clonar o descargar el proyecto
cd simulador

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# Por defecto en: http://localhost:5173
```

### Construcción para Producción
```bash
npm run build
npm run preview
```

## 🎮 Uso

### Iniciar la Aplicación

1. Ejecuta `npm run dev` desde la carpeta `simulador`
2. Abre tu navegador en `http://localhost:5173`
3. Verás la pantalla de configuración inicial

## 📚 Manual de Usuario

### Pantalla 1: Configuración (CONFIG)

Esta es la pantalla inicial donde defines todos los parámetros de tu simulación.

#### Pasos Principales:

1. **Configurar Quantum**
   - Ingresa el quantum en unidades de tiempo
   - El quantum es el tiempo máximo que cada proceso puede ejecutar en Round Robin
   - Valor recomendado: 4-10 unidades
   - Ejemplo: Si quantum = 4, cada proceso en RR puede ejecutar máximo 4 unidades de tiempo

2. **Agregar Procesos**

   Opción A - Agregar Manual:
   - Haz clic en el botón "+" en la tarjeta de proceso
   - Se abrirá un modal con campos:
     - **ID:** Identificador único (ej: P1, P2, P3)
     - **Arrival Time:** Momento en que llega el proceso (ej: 0, 5, 10)
     - **Burst Time:** Tiempo que necesita de CPU (ej: 5, 8, 12)
     - **I/O Request Time (Opcional):** En qué momento del burst solicita I/O (ej: 3)
   - Haz clic en "AGREGAR"

   Opción B - Generar Aleatorio:
   - Haz clic en "GENERATE RANDOM"
   - Se añadirá automáticamente un nuevo proceso con valores aleatorios
   - Repite según necesites

3. **Visualización de Procesos**
   - En la sección principal verás todas tus tarjetas de proceso
   - Cada tarjeta muestra:
     - Identificador (color)
     - Tiempo de llegada
     - Tiempo de ráfaga
     - Información de I/O si aplica
   - Haz clic en la "X" roja para eliminar un proceso

4. **Iniciar Simulación**
   - Asegúrate de tener al menos 1 proceso
   - Haz clic en "START SIMULATION"
   - Se abrirá la pantalla de simulación

#### Ejemplo de Configuración:
```
Quantum: 4
Procesos:
  - P1: Arrival=0, Burst=5, I/O=3
  - P2: Arrival=2, Burst=4
  - P3: Arrival=5, Burst=6, I/O=4
```

### Pantalla 2: Simulación (SIMULATION)

Visualiza cómo los tres algoritmos ejecutan los procesos.

#### Componentes Principales:

1. **Panel de Control Izquierdo**
   - **Reloj:** Muestra el tiempo actual de simulación
   - **Estado:** Indica si la simulación está corriendo, pausada o completada
   - **Botones de Control:**
     - ▶ PLAY: Inicia o reanuda la simulación
     - ⏸ PAUSE: Pausa la ejecución
     - ⏹ FINISH: Termina la simulación y ve a resultados
   - **Velocidad:** Ajusta la velocidad de reproducción (1x, 2x, 3x, etc.)

2. **Tres Paneles de Algoritmo (VRR, MLFQ, SRTF)**
   
   Cada panel muestra:
   - **Gráfica Gantt:** Visualización temporal de qué proceso está ejecutándose en cada momento
     - Colores diferentes para cada proceso
     - Secciones IDLE cuando no hay procesos listos
     - Etiquetas de tiempo en los puntos clave
   
   - **Estado Actual:**
     - Proceso en ejecución (Running)
     - Cola de procesos listos (Ready Queue)
     - Procesos en operación I/O (I/O List)
     - Procesos completados (Completed)

3. **Monitoreo en Tiempo Real**
   - Observa cómo cambian las colas mientras avanza el reloj
   - Identifica cuándo los procesos entran en I/O
   - Nota las diferencias en comportamiento entre algoritmos

#### Cómo Usar:

```
1. La simulación comienza automáticamente
2. Presiona PAUSE para estudiar un momento específico
3. Ajusta la velocidad si quieres verlo más lentamente
4. Cuando termines, presiona FINISH para ver los resultados
```

### Pantalla 3: Resultados (RESULTS)

Visualización comparativa del desempeño de los tres algoritmos.

#### Componentes:

1. **Tarjetas de Algoritmos**
   - Ordenadas por mejor a peor desempeño (en términos de tiempo de espera)
   - Ganador marcado con 🏆
   - Cada tarjeta muestra:
     - Tiempo de espera promedio
     - Tiempo de retorno promedio
     - Utilización de CPU
     - Throughput (procesos completados por unidad de tiempo)

2. **Gráfico de Radar**
   - Comparación visual de 5 métricas:
     - **Wait:** Tiempo de espera promedio (menor es mejor)
     - **Resp:** Tiempo de respuesta promedio (menor es mejor)
     - **Turn:** Tiempo de retorno promedio (menor es mejor)
     - **CPU:** Utilización de CPU (mayor es mejor)
     - **Thr:** Throughput (mayor es mejor)
   - Cada algoritmo es una línea/área diferente
   - Algoritmo con área más grande = mejor rendimiento general

#### Interpretación:

- **Algoritmo Ganador:** El que tiene el menor tiempo de espera promedio
- **CPU Util (Utilización):** Porcentaje de tiempo que la CPU está activa (no IDLE)
- **Throughput:** Cantidad de procesos completados por unidad de tiempo

### Volver a la Configuración

- Desde la pantalla de RESULTADOS, haz clic en "BACK" o el botón "CONFIG"
- Puedes modificar parámetros y ejecutar una nueva simulación

## 🔄 Algoritmos Soportados

### 1. Round Robin (RR) / Virtual Round Robin (VRR)

**¿Qué es?** Cada proceso obtiene un quantum de tiempo (turno). Si no termina, va al final de la cola.

**Características:**
- Justo y predecible
- Buen tiempo de respuesta
- Soporta I/O (proceso pasa a I/O list mientras espera)

**Cuándo es mejor:**
- Sistemas interactivos
- Cuando necesitas respuesta rápida a usuarios
- Ambientes multiusuario

### 2. Multilevel Feedback Queue (MLFQ)

**¿Qué es?** Múltiples colas con diferentes prioridades. Los procesos se mueven entre colas según su comportamiento.

**Características:**
- 3 niveles de cola (Q0, Q1, Q2) con quanta: 5, 10, 20
- Boost cada 50 unidades (todos vuelven a Q0)
- Los procesos se degradan si usan todo su quantum
- Los procesos se promueven si completan su trabajo rápido

**Cuándo es mejor:**
- Procesos interactivos vs. batch
- Adaptarse automáticamente a la naturaleza del proceso
- Balance entre tiempo de respuesta y throughput

### 3. Shortest Remaining Time First (SRTF)

**¿Qué es?** Siempre ejecuta el proceso con menor tiempo restante.

**Características:**
- Preemptivo (puede interrumpir proceso en ejecución)
- Minimiza tiempo de espera
- Requiere conocer el tiempo de ejecución de antemano

**Cuándo es mejor:**
- Cuando quieres minimizar tiempo de espera promedio
- Procesos con tiempos conocidos
- Máxima eficiencia teórica

## 📊 Métricas de Desempeño

### Métricas Calculadas

1. **Waiting Time (Tiempo de Espera)**
   ```
   Fórmula: Completion Time - Arrival Time - Burst Time
   Significado: Cuánto tiempo estuvo el proceso esperando en cola
   ```

2. **Turnaround Time (Tiempo de Retorno)**
   ```
   Fórmula: Completion Time - Arrival Time
   Significado: Tiempo total desde que llega hasta que termina
   ```

3. **Response Time (Tiempo de Respuesta)**
   ```
   Fórmula: First Run Time - Arrival Time
   Significado: Cuánto tiempo esperó antes de ejecutarse por primera vez
   ```

4. **CPU Utilization (Utilización de CPU)**
   ```
   Fórmula: (Tiempo de ejecución útil / Tiempo total) × 100
   Significado: Porcentaje de tiempo que la CPU estuvo procesando
   ```

5. **Throughput (Rendimiento)**
   ```
   Fórmula: Procesos completados / Tiempo total
   Significado: Procesos que se completan por unidad de tiempo
   ```

6. **Fairness (Equidad)**
   ```
   Fórmula: Coefficient of Variation de waiting times
   Significado: Qué tan equitativo es el acceso al CPU (menor es mejor)
   ```

## 💡 Ejemplos de Uso

### Ejemplo 1: Comparar Quantum
```
Configuración 1:
  - Quantum = 2
  - Procesos: P1(Arr=0, Burst=8), P2(Arr=2, Burst=6)
  
Resultado: RR tendrá muchos cambios de contexto

Configuración 2:
  - Quantum = 20
  - Mismos procesos
  
Resultado: RR se comportará casi como FCFS
```

### Ejemplo 2: Ventajas de MLFQ
```
Mix de procesos:
  - P1: Interactivo (Burst=2)
  - P2: Batch (Burst=20)
  - P3: Interactivo (Burst=3)

MLFQ priorizará P1 y P3 por ser rápidos
SRTF hará esperar a P3 por P2
RR tratará a todos igual
```

### Ejemplo 3: Impacto de I/O
```
Con I/O:
  - P1(Burst=10, I/O@5): Solicita I/O a mitad de ejecución
  
Observarás:
  - El proceso pasa a I/O list
  - Otros procesos pueden ejecutar mientras P1 espera I/O
  - Mejor utilización de CPU
```

## 🎯 Casos de Uso Recomendados

### Para Estudiantes
- Experimento 1: ¿Cómo afecta el quantum al desempeño de RR?
- Experimento 2: ¿Por qué SRTF tiene mejor tiempo de espera pero es impráctica?
- Experimento 3: ¿Cómo MLFQ intenta ser justa sin sacrificar rendimiento?

### Para Docentes
- Usar como herramienta de demostración en clase
- Crear tareas prácticas de análisis
- Comparar comportamiento teórico vs. simulación

## 🚀 Comandos Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo con HMR
npm run build    # Construir para producción
npm run preview  # Vista previa de la construcción
npm run lint     # Validar código con ESLint
```

## 🔍 Interpretación de Resultados

### ¿Cuál Algoritmo Elegir?

| Situación | Mejor Algoritmo | Razón |
|-----------|---|---|
| Sistema interactivo | MLFQ | Balance automático entre usuarios |
| Minimizar espera | SRTF | Ejecuta lo más rápido primero |
| Equidad | RR | Todos obtienen tiempo igual |
| Máximo throughput | Depende | Varía según cargas |

## 📝 Notas Importantes

1. **Procesos Simultáneos:** Solo un proceso puede ejecutar a la vez (como en CPU real)
2. **I/O Ideal:** La simulación asume I/O instantáneo tras completarse (sin duración)
3. **Precisión:** Los resultados son aproximaciones educativas, no de producción
4. **Contexto:** Cambios de proceso tienen costo negligible (0 unidades de tiempo)

## 🐛 Solución de Problemas

**P: La simulación no avanza**
- Asegúrate de haber presionado PLAY
- Verifica que al menos 1 proceso esté configurado

**P: No veo diferencias entre algoritmos**
- Incrementa la cantidad de procesos
- Usa tiempos de llegada variados
- Agrega operaciones I/O

**P: ¿Por qué SRTF se ve vacío?**
- SRTF puede tener IDLE si todos los procesos están en I/O
- Es comportamiento correcto

## 📄 Licencia

Proyecto de código abierto para fines educativos.

## 👥 Autores

Desarrollado como herramienta educativa para sistemas operativos.

---

**¿Tienes preguntas?** Experimenta con la simulación, cambia parámetros y observa cómo reaccionan los algoritmos. ¡La mejor forma de aprender es jugando! 🎮

