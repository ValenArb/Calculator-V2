# Especificación de Fórmulas - Calculadora Eléctrica Profesional

## 1. Cálculos Básicos de Circuitos

### 1.1 Cálculo de Caída de Tensión

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Carga:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Factor de potencia:** Campo numérico (valor predeterminado 0.9)
* **Calibre:** Menú desplegable con las opciones:
  * 0.5, 1, 1.5, 2, 2.5, 3, 4, 6, 10, 16, 25, 35, 50, 70, 95
* **Unidades de calibre:** Menú desplegable:
  * mm²
* **Conductores de fase en paralelo:** Campo numérico (valor predeterminado 1)
* **Longitud de la línea:** Campo numérico con dropdown de unidades:
  * m (metros)
* **Conductor:** Menú desplegable con opciones:
  * Cobre
  * Aluminio
* **Tipo de cable:** Menú desplegable con opciones:
  * Unipolar
  * Multipolar
* **Temperatura de funcionamiento:** Campo numérico (valor predeterminado 70) con dropdown de unidades:
  * °C

**Fórmulas:**

Para **Corriente Continua** y **Alterna Monofásica:**
* I = P / (V × cos φ)
* ΔV = (2 × ρ × L × I) / S

Para **Alterna Trifásica:**
* I = P / (√3 × V × cos φ)
* ΔV = (√3 × ρ × L × I) / S

Para **Alterna Bifásica:**
* I = P / (2 × V × cos φ)
* ΔV = (√2 × ρ × L × I) / S

**Donde:**
* I = Corriente en amperios
* P = Potencia en watts
* V = Tensión en voltios
* cos φ = Factor de potencia
* ΔV = Caída de tensión en voltios
* ρ = Resistividad del conductor (Cobre: 0.017241, Aluminio: 0.028264)
* L = Longitud del cable en metros
* S = Sección del conductor en mm²

---

### 1.2 Cálculo de la Corriente

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Entradas:** Menú desplegable con opciones:
  * Tensión / Potencia
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Potencia:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Cos φ:** Menú desplegable con campo numérico (valor predeterminado 0.9)

**Fórmulas:**

Para **Corriente Continua:**
* I = P / V

Para **Alterna Monofásica:**
* I = P / (V × cos φ)

Para **Alterna Trifásica:**
* I = P / (√3 × V × cos φ)

Para **Alterna Bifásica:**
* I = P / (2 × V × cos φ)

**Donde:**
* I = Corriente en amperios
* P = Potencia en watts
* V = Tensión en voltios
* cos φ = Factor de potencia

---

### 1.3 Cálculo de la Impedancia

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Entradas:** Menú desplegable con opciones:
  * Tensión / Corriente
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Corriente:** Campo numérico con dropdown de unidades:
  * A (amperios)

**Fórmula:**
* Z = V / I

**Donde:**
* Z = Impedancia en ohmios
* V = Tensión en voltios
* I = Corriente en amperios

---

### 1.4 Cálculo de la Tensión

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Entradas:** Menú desplegable con opciones:
  * Corriente / Potencia
* **Corriente:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Potencia:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Cos φ:** Menú desplegable con campo numérico (valor predeterminado 0.9)

**Fórmulas:**

Para **Corriente Continua:**
* V = P / I

Para **Alterna Monofásica:**
* V = P / (I × cos φ)

Para **Alterna Trifásica:**
* V = P / (√3 × I × cos φ)

Para **Alterna Bifásica:**
* V = P / (2 × I × cos φ)

**Donde:**
* V = Tensión en voltios
* P = Potencia en watts
* I = Corriente en amperios
* cos φ = Factor de potencia

---

## 2. Cálculos de Potencia

### 2.1 Cálculo de la Potencia Activa

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Entradas:** Menú desplegable con opciones:
  * Tensión / Corriente
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Corriente:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Cos φ:** Menú desplegable con campo numérico (valor predeterminado 0.9)

**Fórmulas:**

Para **Corriente Continua:**
* P = V × I

Para **Alterna Monofásica:**
* P = V × I × cos φ

Para **Alterna Trifásica:**
* P = √3 × V × I × cos φ

Para **Alterna Bifásica:**
* P = 2 × V × I × cos φ

**Donde:**
* P = Potencia activa en watts
* V = Tensión en voltios
* I = Corriente en amperios
* cos φ = Factor de potencia

---

### 2.2 Cálculo de la Potencia Aparente

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Entradas:** Menú desplegable con opciones:
  * Tensión / Corriente
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Corriente:** Campo numérico con dropdown de unidades:
  * A (amperios)

**Fórmulas:**

Para **Alterna Monofásica:**
* S = V × I

Para **Alterna Trifásica:**
* S = √3 × V × I

Para **Alterna Bifásica:**
* S = 2 × V × I

**Donde:**
* S = Potencia aparente en VA (volt-amperios)
* V = Tensión en voltios
* I = Corriente en amperios

---

### 2.3 Cálculo de la Potencia Reactiva

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Entradas:** Menú desplegable con opciones:
  * Tensión / Corriente
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Corriente:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Cos φ:** Menú desplegable con campo numérico (valor predeterminado 0.9)

**Fórmulas:**

Para **Alterna Monofásica:**
* Q = V × I × sin φ

Para **Alterna Trifásica:**
* Q = √3 × V × I × sin φ

Para **Alterna Bifásica:**
* Q = 2 × V × I × sin φ

**Donde:**
* Q = Potencia reactiva en VAR (volt-amperios reactivos)
* V = Tensión en voltios
* I = Corriente en amperios
* sin φ = Seno del ángulo de desfase (sin φ = √(1 - cos²φ))

---

### 2.4 Cálculo de la Resistencia

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Entradas:** Menú desplegable con opciones:
  * Tensión / Corriente
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Corriente:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Cos φ:** Menú desplegable con campo numérico (valor predeterminado 0.9)

**Fórmula:**
* R = V / I

**Donde:**
* R = Resistencia en ohmios
* V = Tensión en voltios
* I = Corriente en amperios

---

## 3. Cálculos de Cables y Conductores

### 3.1 Calibre del Cable

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Carga:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Factor de potencia:** Campo numérico (valor predeterminado 0.9)
* **Longitud de la línea:** Campo numérico con dropdown de unidades:
  * m (metros)
* **Máxima caída de tensión:** Campo numérico (valor predeterminado 4) con dropdown de unidades:
  * % (porcentaje)
* **Tipo de instalación:** Campo de texto (valor predeterminado "1 - A1") con botón azul
* **Temperatura ambiente:** Menú desplegable con opciones:
  * 30 °C | 86 °F
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Aislamiento:** Menú desplegable con opciones:
  * PVC
* **Circuitos en el mismo conducto:** Menú desplegable con opciones:
  * 1
* **Aumento de carga:** Campo numérico (valor predeterminado 0) con símbolo %
* **Tamaño máximo de cable permitido:** Menú desplegable con opciones:
  * 1000 mm²
* **Todos los cables paralelos están en un solo conducto:** Interruptor (toggle)
* **Permitir calibres inferiores a 1.5 mm²:** Interruptor (toggle)

**Fórmula para determinar corriente:**

Para **Corriente Continua** y **Alterna Monofásica:**
* I = P / (V × cos φ)

Para **Alterna Trifásica:**
* I = P / (√3 × V × cos φ)

**Fórmula para sección mínima por caída de tensión:**

Para **Monofásica:**
* S = (2 × ρ × L × I) / (ΔV_max × V / 100)

Para **Trifásica:**
* S = (√3 × ρ × L × I) / (ΔV_max × V / 100)

**Capacidad corregida del conductor:**
* I_corregida = I_base × Factor_temperatura × Factor_agrupamiento

**Donde:**
* I = Corriente calculada en amperios
* S = Sección del conductor en mm²
* ρ = Resistividad del conductor
* L = Longitud en metros
* ΔV_max = Caída máxima permitida en porcentaje
* I_corregida = Capacidad del conductor corregida por factores ambientales

---

### 3.2 Cálculo de la Temperatura del Cable

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Carga:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Factor de potencia:** Campo numérico (valor predeterminado 0.9)
* **Tipo de instalación:** Campo de texto (valor predeterminado "1 - A1") con botón azul
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Aislamiento:** Menú desplegable con opciones:
  * PVC
* **Calibre:** Menú desplegable con opciones:
  * 0.5 mm²
* **Temperatura ambiente:** Menú desplegable con opciones:
  * 30 °C | 86 °F
* **Circuitos en el mismo conducto:** Menú desplegable con opciones:
  * 1

**Fórmulas:**

**Corriente calculada:**
* I = P / (V × cos φ) [para monofásica]
* I = P / (√3 × V × cos φ) [para trifásica]

**Resistencia del conductor:**
* R = ρ × L / S

**Pérdidas por efecto Joule:**
* P_perdidas = I² × R

**Temperatura del conductor:**
* T_conductor = T_ambiente + (P_perdidas × R_termica)

**Donde:**
* I = Corriente en amperios
* R = Resistencia del conductor en ohmios
* P_perdidas = Pérdidas de potencia en watts
* T_conductor = Temperatura del conductor en °C
* T_ambiente = Temperatura ambiente en °C
* R_termica = Resistencia térmica conductor-ambiente

---

### 3.3 Capacidad de las Barras Colectoras

**Variables de entrada:**
* **Forma:** Menú desplegable con opciones:
  * Barra plana
* **Ancho:** Campo numérico con dropdown de unidades:
  * mm (milímetros)
* **Espesor:** Campo numérico con dropdown de unidades:
  * mm (milímetros)
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Tipo de corriente:** Menú desplegable con opciones:
  * Corriente alterna
* **Barras en paralelo:** Menú desplegable con opciones:
  * 1
* **Espacio entre las barras:** Campo numérico deshabilitado con dropdown de unidades:
  * mm (milímetros)
* **Temperatura ambiente:** Menú desplegable con opciones:
  * 45 °C | 113 °F
* **Exceso de temperatura sobre la temperatura ambiente:** Menú desplegable con opciones:
  * 30 °C | 86 °F
* **Ventilación:** Menú desplegable con opciones:
  * Interno - Aire limitado
* **Posición:** Menú desplegable con opciones:
  * Vertical
* **Estado de la superficie:** Menú desplegable con opciones:
  * Crudo

**Fórmula:**

**Sección de la barra:**
* S = Ancho × Espesor

**Corriente admisible:**
* I = K × S^(3/4) × ΔT^(1/4)

**Donde:**
* S = Sección transversal en mm²
* I = Corriente admisible en amperios
* K = Constante que depende del material, forma y condiciones de instalación
* ΔT = Elevación de temperatura permitida sobre la ambiente

---

### 3.4 Capacidad de los Conductores Aislados

**Variables de entrada:**
* **Tipo de instalación:** Campo de texto (valor predeterminado "1 - A1") con botón azul
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Aislamiento:** Menú desplegable con opciones:
  * PVC
* **Calibre:** Menú desplegable con opciones:
  * 0.5 mm²
* **Temperatura ambiente:** Menú desplegable con opciones:
  * 30 °C | 86 °F
* **Número de conductores para el circuito:** Menú desplegable con opciones:
  * 2
* **Conductores de fase en paralelo:** Menú desplegable con opciones:
  * 1
* **Circuitos en el mismo conducto:** Menú desplegable con opciones:
  * 1
* **Factor de reducción para cables paralelos (si están presentes):** Interruptor (toggle)

**Fórmula:**

**Capacidad corregida:**
* I_final = I_base × F_temp × F_agrup × N_paralelo

**Donde:**
* I_final = Corriente admisible final en amperios
* I_base = Corriente base según tabla de ampacidad
* F_temp = Factor de corrección por temperatura
* F_agrup = Factor de corrección por agrupamiento
* N_paralelo = Número de conductores en paralelo

---

### 3.5 Capacidad de los Conductores Desnudos

**Variables de entrada:**
* **Tipo de instalación:** Campo de texto (valor predeterminado "1 - C") con botón azul
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Tipo:** Menú desplegable con opciones:
  * Revestido de PVC
* **Calibre:** Menú desplegable con opciones:
  * 1.5 mm²
* **Conductores de fase en paralelo:** Menú desplegable con opciones:
  * 1
* **Temperatura ambiente:** Menú desplegable con opciones:
  * 30 °C | 86 °F
* **Circuitos en el mismo conducto:** Menú desplegable con opciones:
  * 1

**Fórmula:**

**Capacidad corregida:**
* I_final = I_base × F_temp × F_agrup × N_paralelo

**Donde:**
* I_final = Corriente admisible final en amperios
* I_base = Corriente base para conductores desnudos según tabla
* F_temp = Factor de corrección por temperatura (diferente para conductores desnudos)
* F_agrup = Factor de corrección por agrupamiento
* N_paralelo = Número de conductores en paralelo

---

## 4. Análisis de Circuitos Específicos

### 4.1 Análisis de Sobretensiones de Origen Atmosférico

**Variables de entrada:**
* **De:** Campo de texto (valor predeterminado "Alessio Piamonti")
* **Ambiente:** Selección de botones (radio buttons). Las opciones son:
  * Rural o suburbano
  * Urbano
* **Longitud de la línea:** Menú desplegable con opciones:
  * Conocida
* **LPAL - Línea aérea de baja tensión:** Campo numérico con dropdown de unidades:
  * m (metros)
* **LPCL - Línea subterránea de baja tensión:** Campo numérico con dropdown de unidades:
  * m (metros)
* **LTAH - Línea aérea de alta tensión:** Campo numérico con dropdown de unidades:
  * m (metros)
* **LTCH - Línea subterránea de alta tensión:** Campo numérico con dropdown de unidades:
  * m (metros)
* **Densidad de fulminación:** Campo numérico con texto "Destellos por km² por año"

**Fórmula:**

**Área de captura equivalente:**
* Ae = (LPAL + LTAH) × 40 + (LPCL + LTCH) × 0

**Número de descargas directas por año:**
* Nd = Ng × Ae × 10^(-6)

**Donde:**
* Ae = Área de captura equivalente en m²
* Ng = Densidad de fulminación (descargas/km²/año)
* Nd = Número esperado de descargas directas por año

---

### 4.2 Corriente de Cortocircuito con Subestación Transformadora

**Variables de entrada:**
* **Potencia de cortocircuito en red:** Menú desplegable con campo numérico (símbolo ∞)
* **Voltaje primario:** Campo numérico con dropdown de unidades:
  * kV (kilovoltios)
* **Voltaje secundario:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Potencia del transformador:** Campo numérico con dropdown de unidades:
  * kVA (kilovolt-amperios)
* **Tensión de cortocircuito:** Campo numérico con dropdown de unidades:
  * % (porcentaje)
* **Pérdidas por efecto Joule:** Campo numérico con dropdown de unidades:
  * kW (kilowatts)
* **Longitud de la línea de media tensión:** Campo numérico con dropdown de unidades:
  * m (metros)
* **Tipo de línea:** Menú desplegable con opciones:
  * Línea aérea
* **Tamaño del cable de media tensión:** Menú desplegable con opciones:
  * 10
* **Unidades del cable de media tensión:** Menú desplegable con opciones:
  * mm²
* **Conductores de media tensión en paralelo:** Menú desplegable con opciones:
  * 1
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Longitud de la línea de baja tensión:** Campo numérico con dropdown de unidades:
  * m (metros)
* **Tamaño del cable de baja tensión:** Menú desplegable con opciones:
  * 10
* **Unidades del cable de baja tensión:** Menú desplegable con opciones:
  * mm²
* **Conductores de baja tensión en paralelo:** Menú desplegable con opciones:
  * 1
* **Conductor:** Menú desplegable con opciones:
  * Cobre

**Fórmulas:**

**Impedancia del transformador:**
* Z_trafo = (Ucc / 100) × (V_sec² / S_nom)

**Impedancia de la línea de media tensión:**
* Z_MT = (ρ × L_MT) / S_MT

**Impedancia de la línea de baja tensión:**
* Z_BT = (ρ × L_BT) / S_BT

**Impedancia total:**
* Z_total = Z_trafo + Z_MT + Z_BT

**Corriente de cortocircuito trifásica:**
* Icc = V_sec / (√3 × Z_total)

**Donde:**
* Z_trafo = Impedancia del transformador en ohmios
* Ucc = Tensión de cortocircuito en %
* V_sec = Tensión secundaria en voltios
* S_nom = Potencia nominal del transformador en VA
* Z_MT, Z_BT = Impedancias de líneas de media y baja tensión
* ρ = Resistividad del conductor
* L = Longitud de la línea
* S = Sección del conductor

---

## 5. Dispositivos Específicos

### 5.1 Efecto Joule

**Variables de entrada:**
* **Resistencia:** Menú desplegable
* **Corriente:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Tiempo:** Campo numérico con dropdown de unidades:
  * s (segundos)

**Fórmula:**
* W = I² × R × t

**Donde:**
* W = Energía disipada en joules
* I = Corriente en amperios
* R = Resistencia en ohmios
* t = Tiempo en segundos

---

### 5.2 Frecuencia de Resonancia

**Variables de entrada:**
* **Inductancia:** Campo numérico con dropdown de unidades:
  * mH (milihenrios)
* **Capacitancia:** Campo numérico con dropdown de unidades:
  * μF (microfaradios)

**Fórmula:**
* f = 1 / (2π × √(L × C))

**Donde:**
* f = Frecuencia de resonancia en Hz
* L = Inductancia en henrios
* C = Capacitancia en faradios
* π = 3.14159...

---

### 5.3 Reactancia

**Variables de entrada:**
* **Calcular:** Menú desplegable con opciones:
  * Reactancia inductiva
* **Frecuencia:** Campo numérico con dropdown de unidades:
  * Hz (hercios)
* **Inductancia:** Campo numérico con dropdown de unidades:
  * H (henrios)

**Fórmulas:**

**Para Reactancia Inductiva:**
* XL = 2π × f × L

**Para Reactancia Capacitiva:**
* XC = 1 / (2π × f × C)

**Donde:**
* XL = Reactancia inductiva en ohmios
* XC = Reactancia capacitiva en ohmios
* f = Frecuencia en hercios
* L = Inductancia en henrios
* C = Capacitancia en faradios

---

### 5.4 Duración de las Baterías

**Variables de entrada:**
* **Conexión:** Menú desplegable con opciones:
  * Solo
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Capacidad:** Campo numérico con dropdown de unidades:
  * Ah (amperios-hora)
* **Carga:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Coeficiente de Peukert:** Campo numérico (valor predeterminado 1)
* **Profundidad de descarga (DOD):** Campo numérico (valor predeterminado 100) con símbolo %

**Fórmulas:**

**Corriente de descarga:**
* I = P / V

**Capacidad real (Ley de Peukert):**
* C_real = C_nominal × (I_nominal / I_descarga)^(n-1)

**Tiempo de descarga:**
* t = (C_real × DOD / 100) / I_descarga

**Donde:**
* I = Corriente de descarga en amperios
* P = Potencia de la carga en watts
* V = Tensión de la batería en voltios
* C_real = Capacidad real disponible en Ah
* C_nominal = Capacidad nominal de la batería en Ah
* n = Coeficiente de Peukert
* DOD = Profundidad de descarga en %
* t = Tiempo de descarga en horas

---

## 6. Herramientas de Códigos y Referencias

### 6.1 Código de Color de la Resistencia

**Variables de entrada:**
* **Número de bandas:** Selección de botones (radio buttons). Las opciones son:
  * 3
  * 4
  * 5
  * 6
* **Primera banda:** Menú desplegable con opciones de colores:
  * Negro, Marrón, Rojo, Naranja, Amarillo, Verde, Azul, Violeta, Gris, Blanco
* **Segunda banda:** Menú desplegable con opciones de colores:
  * Negro, Marrón, Rojo, Naranja, Amarillo, Verde, Azul, Violeta, Gris, Blanco
* **Tercera banda:** Menú desplegable con opciones de colores:
  * Negro, Marrón, Rojo, Naranja, Amarillo, Verde, Azul, Violeta, Gris, Blanco, Oro, Plata
* **Cuarta banda:** Menú desplegable con opciones de colores:
  * Oro, Plata, Marrón, Rojo, Verde, Azul, Violeta, Gris

**Fórmula:**

**Para resistencias de 4 bandas:**
* R = (Primera_banda × 10 + Segunda_banda) × 10^Tercera_banda

**Tabla de valores por color:**
* Negro = 0, Marrón = 1, Rojo = 2, Naranja = 3, Amarillo = 4
* Verde = 5, Azul = 6, Violeta = 7, Gris = 8, Blanco = 9

**Para multiplicadores:**
* Negro = ×1, Marrón = ×10, Rojo = ×100, Naranja = ×1,000
* Amarillo = ×10,000, Verde = ×100,000, Azul = ×1,000,000
* Oro = ×0.1, Plata = ×0.01

---

### 6.2 Código de Color del Inductor

**Variables de entrada:**
* **Primera banda:** Menú desplegable con opciones de colores:
  * Negro, Marrón, Rojo, Naranja, Amarillo, Verde, Azul, Violeta, Gris, Blanco
* **Segunda banda:** Menú desplegable con opciones de colores:
  * Negro, Marrón, Rojo, Naranja, Amarillo, Verde, Azul, Violeta, Gris, Blanco
* **Tercera banda:** Menú desplegable con opciones de colores:
  * Negro, Marrón, Rojo, Naranja, Amarillo, Verde, Azul, Violeta, Gris, Blanco
* **Cuarta banda:** Menú desplegable con opciones de colores:
  * Negro, Marrón, Rojo, Naranja, Amarillo, Verde, Azul, Violeta, Gris, Blanco

**Fórmula:**
* L = (Primera_banda × 10 + Segunda_banda) × 10^Tercera_banda μH

**Donde:**
* L = Inductancia en microhenrios (μH)
* Los valores de colores son los mismos que para resistencias

---

### 6.3 Código de Condensadores

**Variables de entrada:**
* **Código:** Campo de texto

**Interpretación del código:**
**Para códigos de 3 dígitos:**
* Capacitancia = (Primeros_dos_dígitos) × 10^(Tercer_dígito) pF

**Ejemplo:**
* Código 104 = 10 × 10^4 = 100,000 pF = 100 nF = 0.1 μF

---

### 6.4 Código de Resistencias SMD

**Variables de entrada:**
* **Código:** Campo de texto
* **Barra sobre el código:** Interruptor (toggle)
* **Barra debajo del código:** Interruptor (toggle)
* **Utilice el código BS 1852:** Interruptor (toggle)

**Fórmulas según el tipo de código:**

**Para códigos de 3 dígitos:**
* R = (Primeros_dos_dígitos) × 10^(Tercer_dígito) Ω

**Para códigos de 4 dígitos:**
* R = (Primeros_tres_dígitos) × 10^(Cuarto_dígito) Ω

**Para códigos con letras (EIA-96):**
* Se utiliza una tabla de correspondencia específica

---

### 6.5 Colores de una Resistencia según su Valor

**Variables de entrada:**
* **Valor:** Campo numérico con dropdown de unidades:
  * Ω (ohmios)
* **Tolerancia:** Menú desplegable con opciones:
  * 5% (E24)
* **PPM:** Menú desplegable con opciones:
  * Sin color

**Fórmula inversa:**
A partir del valor en ohmios, determinar los colores correspondientes de las bandas.

---

## 7. Calculadoras de Conversión y Herramientas Avanzadas

### 7.1 Valores de Señal Analógica (Conversión entre rangos)

**Variables de entrada:**
* **Rango de entrada:** Menú desplegable con opciones:
  * Personalizado
* **Mínimo (entrada):** Campo numérico con símbolo "-"
* **Máximo (entrada):** Campo numérico con símbolo "-"
* **Valor (entrada):** Campo numérico con símbolo "-"
* **Rango de salida:** Menú desplegable con opciones:
  * Personalizado
* **Mínimo (salida):** Campo numérico con símbolo "-"
* **Máximo (salida):** Campo numérico con símbolo "-"

**Fórmula:**
* Valor_salida = ((Valor_entrada - Min_entrada) / (Max_entrada - Min_entrada)) × (Max_salida - Min_salida) + Min_salida

---

### 7.2 Calculador de Espacio en Disco Duro y Ancho de Banda

**Variables de entrada:**
* **Codificación de colores:** Menú desplegable con opciones:
  * PAL
* **Resolución:** Menú desplegable con opciones:
  * QCIF - 176x144
* **Cuadros por segundo:** Menú desplegable con opciones:
  * 25 fps
* **Algoritmos de compresión:** Menú desplegable con opciones:
  * MJPEG
* **Calidad:** Menú desplegable con opciones:
  * Normal
* **Cantidad de cámaras:** Campo numérico
* **Horas por día:** Campo numérico
* **Días a grabar:** Campo numérico

**Fórmulas:**

**Tasa de bits sin compresión:**
* Bits_por_pixel = 24 (para color RGB)
* Bits_por_frame = Resolución_X × Resolución_Y × Bits_por_pixel
* Bits_por_segundo = Bits_por_frame × FPS

**Con compresión:**
* Bits_comprimidos = Bits_por_segundo / Factor_compresión

**Espacio total necesario:**
* Espacio_total = (Bits_comprimidos / 8) × Horas_día × Días × Cámaras

---

### 7.3 Longitud de la Antena

**Variables de entrada:**
* **Frecuencia:** Campo numérico con dropdown de unidades:
  * kHz (kilohercios)
* **Factor de velocidad:** Campo numérico (valor predeterminado 0.95)

**Fórmulas:**

**Longitud de onda:**
* λ = c / f = 300,000 / f_kHz metros

**Longitud del dipolo de media onda:**
* L_dipolo = (λ / 2) × Factor_velocidad

**Longitud del monopolo de cuarto de onda:**
* L_monopolo = (λ / 4) × Factor_velocidad

**Donde:**
* λ = Longitud de onda en metros
* c = Velocidad de la luz (300,000 km/s)
* f = Frecuencia en kHz
* L = Longitud física de la antena en metros

---

## 8. Cálculos Avanzados de Potencia y Factor de Potencia

### 8.1 Corrección del Factor de Potencia

**Variables de entrada:**
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Frecuencia:** Campo numérico con dropdown de unidades:
  * Hz (hercios)
* **Carga:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Factor de potencia:** Campo numérico
* **Factor de potencia deseado:** Campo numérico
* **Voltaje del condensador:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Tipo:** Menú desplegable con opciones:
  * Monofásica

**Fórmulas:**

**Ángulo de fase actual:**
* φ1 = arccos(cos φ_actual)

**Ángulo de fase deseado:**
* φ2 = arccos(cos φ_deseado)

**Potencia reactiva a compensar:**
* Q_compensar = P × (tan φ1 - tan φ2)

**Capacidad del condensador:**
* C = Q_compensar / (2π × f × V²)

**Para sistemas trifásicos:**
* Q_total = 3 × Q_fase
* C_fase = Q_compensar / (3 × 2π × f × V_fase²)

---

### 8.2 Corrección del Factor de Potencia en Transformadores MV/LV

**Variables de entrada:**
* **Potencia:** Campo numérico con dropdown de unidades:
  * kVA (kilovolt-amperios)
* **Corriente sin carga:** Campo numérico con texto "I₀ %"

**Fórmulas:**

**Corriente sin carga:**
* I₀ = (I₀_porcentaje / 100) × I_nominal

**Potencia reactiva sin carga:**
* Q₀ = √3 × V × I₀ × sin φ₀

**Factor de potencia sin carga típico:**
* cos φ₀ = 0.2 (valor típico para transformadores)

---

### 8.3 Cálculo del Factor de Potencia

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Entradas:** Menú desplegable con opciones:
  * Tensión / Corriente / Potencia activa
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Corriente:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Potencia activa:** Campo numérico con dropdown de unidades:
  * W (watts)

**Fórmulas:**

**Potencia aparente:**
Para monofásica: S = V × I
Para trifásica: S = √3 × V × I

**Factor de potencia:**
* cos φ = P / S

**Potencia reactiva:**
* Q = √(S² - P²)

**Ángulo de fase:**
* φ = arccos(P / S)

---

## 9. Divisores y Circuitos Básicos

### 9.1 Divisor de Corriente

**Variables de entrada:**
* **Calcular:** Menú desplegable con opciones:
  * I
* **I1:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **R1:** Campo numérico con dropdown de unidades:
  * Ω (ohmios)
* **R2:** Campo numérico con dropdown de unidades:
  * Ω (ohmios)

**Fórmulas:**

**Para resistencias en paralelo:**
* I_total = I1 + I2
* I1 = I_total × (R2 / (R1 + R2))
* I2 = I_total × (R1 / (R1 + R2))

**Resistencia equivalente:**
* R_eq = (R1 × R2) / (R1 + R2)

---

### 9.2 Divisor de Tensión

**Variables de entrada:**
* **Calcular:** Menú desplegable con opciones:
  * V out
* **V in:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **R1:** Campo numérico con dropdown de unidades:
  * Ω (ohmios)
* **R2:** Campo numérico con dropdown de unidades:
  * Ω (ohmios)

**Fórmulas:**

**Para resistencias en serie:**
* V_out = V_in × (R2 / (R1 + R2))
* V_R1 = V_in × (R1 / (R1 + R2))

**Corriente total:**
* I = V_in / (R1 + R2)

---

### 9.3 Diodo Zener como Estabilizador de Voltaje

**Variables de entrada:**
* **Calcular:** Menú desplegable con opciones:
  * Resistencia
* **Tensión de alimentación:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Diodo Zener:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Absorción:** Campo numérico con dropdown de unidades:
  * mA (miliamperios)

**Fórmulas:**

**Resistencia limitadora:**
* R = (V_in - V_z) / I_total

**Corriente del Zener:**
* I_z = I_total - I_carga

**Potencia disipada en el Zener:**
* P_z = V_z × I_z

**Donde:**
* V_in = Tensión de alimentación
* V_z = Tensión del Zener
* I_total = Corriente total
* I_carga = Corriente de la carga
* I_z = Corriente a través del Zener

---

## 10. Sensores y Medición

### 10.1 Sensores de Temperatura (PT/NI/CU, NTC, Termopares)

**Variables de entrada:**
* **Calcular:** Menú desplegable con opciones:
  * Resistencia
* **Tipo:** Menú desplegable con opciones:
  * PT
* **Resistencia a 0°C | 32°F:** Campo numérico con dropdown de unidades:
  * Ω (ohmios)
* **Temperatura:** Campo numérico con dropdown de unidades:
  * °C (grados Celsius)

**Fórmulas:**

**Para sensores PT (Platino):**
* R(T) = R₀ × (1 + A×T + B×T²)

**Constantes para PT100:**
* R₀ = 100 Ω a 0°C
* A = 3.9083 × 10⁻³ °C⁻¹
* B = -5.775 × 10⁻⁷ °C⁻²

**Para sensores NTC:**
* R(T) = R₂₅ × exp(B × (1/T - 1/298.15))

**Para termopares tipo K:**
* V(T) = Σ(aᵢ × Tᵢ) donde i va de 0 a n

**Donde:**
* R(T) = Resistencia a temperatura T
* R₀ = Resistencia a 0°C
* T = Temperatura en °C (o Kelvin para NTC)
* V(T) = Tensión del termopar en mV

---

### 10.2 Sistema de Puesta a Tierra y Coordinación con Dispositivo Diferencial

**Variables de entrada:**
* **Tipo de electrodo:** Menú desplegable con opciones:
  * Varilla
* **Cantidad:** Campo numérico (valor predeterminado 1)
* **Longitud:** Campo numérico con dropdown de unidades:
  * m (metros)
* **Tipo de suelo:** Menú desplegable con opciones:
  * Agrícola
* **Resistividad:** Campo numérico deshabilitado (valor 50) con dropdown de unidades:
  * Ω × m
* **Tensión de seguridad:** Campo numérico (valor predeterminado 50) con dropdown de unidades:
  * V (voltios)

**Fórmulas:**

**Para electrodo tipo varilla:**
* R = (ρ / 2π × L) × [ln(4 × L / d) - 1]

**Para múltiples electrodos en paralelo:**
* R_total = R_individual / (n × η)

**Coordinación con protección diferencial:**
* R_max = V_seguridad / I_diferencial

**Donde:**
* R = Resistencia de puesta a tierra en ohmios
* ρ = Resistividad del suelo en Ω×m
* L = Longitud del electrodo en metros
* d = Diámetro del electrodo en metros
* n = Número de electrodos
* η = Factor de eficiencia (típicamente 0.6-0.8)
* I_diferencial = Corriente de actuación del diferencial (30, 100, 300 mA)

---

## 11. Protección de Cables y Dispositivos

### 11.1 Protección de Cables contra Cortocircuitos

**Variables de entrada:**
* **Corriente de cortocircuito:** Campo numérico con dropdown de unidades:
  * kA (kiloamperios)
* **Tiempo de intervención de la protección:** Campo numérico con dropdown de unidades:
  * ms (milisegundos)
* **Tipo:** Menú desplegable con opciones:
  * Conductor de Fase
* **Calibre:** Menú desplegable con opciones:
  * 1.5
* **Unidades de calibre:** Menú desplegable con opciones:
  * mm²
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Aislamiento:** Menú desplegable con opciones:
  * PVC
* **K:** Campo numérico (valor 115)

**Fórmula:**

**Energía específica admisible:**
* I²t_admisible = (k × S)²

**Energía específica de la falla:**
* I²t_falla = I_cc² × t

**Condición de protección:**
* I²t_falla ≤ I²t_admisible

**Donde:**
* I_cc = Corriente de cortocircuito en amperios
* t = Tiempo de actuación en segundos
* k = Constante del material y aislamiento
* S = Sección del conductor en mm²

---

### 11.2 Protección para Líneas de Alumbrado de Emergencia

**Variables de entrada:**
* **Potencia del aparato de emergencia:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Cantidad:** Campo numérico
* **Tensión monofásica:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Factor de potencia:** Campo numérico (valor predeterminado 0.9)
* **Dispositivo de protección:** Menú desplegable con opciones:
  * Interruptor termomagnético

**Fórmulas:**

**Potencia total:**
* P_total = P_unitaria × Cantidad

**Corriente total:**
* I_total = P_total / (V × cos φ)

**Corriente de protección:**
* I_protección = I_total × 1.25 (factor de seguridad del 25%)

**Capacidad mínima del conductor:**
* I_conductor ≥ I_protección

---

## 12. Cálculos de Longitud y Pérdidas

### 12.1 Longitud Máxima del Cable (Isc)

**Variables de entrada:**
* **Tipo de corriente:** Menú desplegable con opciones:
  * Trifásico + Neutro
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Corriente nominal del dispositivo de protección:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Curva de disparo:** Menú desplegable con opciones:
  * B
* **Corriente de intervención inmediata:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Sección de Fase:** Menú desplegable con opciones:
  * 1.5
* **Unidades de sección:** Menú desplegable con opciones:
  * mm²
* **Conductores de fase en paralelo:** Menú desplegable con opciones:
  * 1
* **Sección de Neutro:** Menú desplegable con opciones:
  * 1.5
* **Unidades de sección neutro:** Menú desplegable con opciones:
  * mm²
* **Conductores de neutro en paralelo:** Menú desplegable con opciones:
  * 1

**Fórmulas:**

**Impedancia del cable:**
* Z_cable = (ρ × L) / S

**Para cortocircuito monofásico (fase-neutro):**
* I_cc = V / (2 × Z_cable)

**Longitud máxima:**
* L_max = (V × S) / (2 × ρ × I_intervención)

**Donde:**
* L_max = Longitud máxima en metros
* V = Tensión entre fase y neutro
* S = Sección del conductor en mm²
* ρ = Resistividad del conductor
* I_intervención = Corriente de intervención inmediata del dispositivo

---

### 12.2 Longitud Máxima del Cable (ΔV)

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Carga:** Campo numérico con dropdown de unidades:
  * W (watts)
* **Factor de potencia:** Campo numérico (valor predeterminado 0.9)
* **Calibre:** Menú desplegable con opciones:
  * 0.5
* **Unidades de calibre:** Menú desplegable con opciones:
  * mm²
* **Conductores de fase en paralelo:** Menú desplegable con opciones:
  * 1
* **Caída de tensión:** Campo numérico (valor predeterminado 4) con dropdown de unidades:
  * % (porcentaje)
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Tipo de cable:** Menú desplegable con opciones:
  * Unipolar
* **Temperatura de funcionamiento:** Campo numérico (valor predeterminado 70) con dropdown de unidades:
  * °C (grados Celsius)

**Fórmulas:**

**Corriente de carga:**
Para monofásica: I = P / (V × cos φ)
Para trifásica: I = P / (√3 × V × cos φ)

**Longitud máxima por caída de tensión:**

Para monofásica:
* L_max = (ΔV_% × V × S) / (100 × 2 × ρ × I)

Para trifásica:
* L_max = (ΔV_% × V × S) / (100 × √3 × ρ × I)

**Donde:**
* L_max = Longitud máxima en metros
* ΔV_% = Caída de tensión máxima permitida en %
* V = Tensión nominal
* S = Sección del conductor en mm²
* ρ = Resistividad del conductor a temperatura de funcionamiento
* I = Corriente de carga en amperios

---

### 12.3 Pérdida de Potencia en Cables

**Variables de entrada:**
* **Tipo de corriente:** Selección de botones (radio buttons). Las opciones son:
  * Continua
  * Alterna monofásica
  * Alterna bifásica
  * Alterna trifásica
* **Tensión:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Carga:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Factor de potencia:** Campo numérico (valor predeterminado 0.9)
* **Calibre:** Menú desplegable con opciones:
  * 0.5
* **Unidades de calibre:** Menú desplegable con opciones:
  * mm²
* **Conductores de fase en paralelo:** Menú desplegable con opciones:
  * 1
* **Longitud:** Campo numérico con dropdown de unidades:
  * m (metros)
* **Temperatura de funcionamiento:** Campo numérico (valor predeterminado 70) con dropdown de unidades:
  * °C (grados Celsius)
* **Conductor:** Menú desplegable con opciones:
  * Cobre

**Fórmulas:**

**Resistencia del conductor:**
* R = (ρ × L) / S

**Para sistemas monofásicos:**
* P_pérdidas = 2 × I² × R

**Para sistemas trifásicos:**
* P_pérdidas = 3 × I² × R

**Eficiencia del sistema:**
* η = (P_útil / (P_útil + P_pérdidas)) × 100%

**Donde:**
* R = Resistencia del conductor en ohmios
* ρ = Resistividad del conductor a temperatura de funcionamiento
* L = Longitud del cable en metros
* S = Sección del conductor en mm²
* I = Corriente en amperios
* P_pérdidas = Potencia perdida en watts

---

## 13. Resistencia, Reactancia e Impedancia del Cable

### 13.1 Resistencia, Reactancia e Impedancia del Cable

**Variables de entrada:**
* **Tipo de corriente:** Menú desplegable con opciones:
  * Corriente alterna
* **Frecuencia:** Campo numérico (valor predeterminado 50) con dropdown de unidades:
  * Hz (hercios)
* **Calibre:** Menú desplegable con opciones:
  * 0.5
* **Unidades de calibre:** Menú desplegable con opciones:
  * mm²
* **Conductores en paralelo:** Menú desplegable con opciones:
  * 1
* **Longitud:** Campo numérico con dropdown de unidades:
  * m (metros)
* **Temperatura:** Campo numérico (valor predeterminado 20) con dropdown de unidades:
  * °C (grados Celsius)
* **Conductor:** Menú desplegable con opciones:
  * Cobre
* **Tipo de cable:** Menú desplegable con opciones:
  * Unipolar

**Fórmulas:**

**Resistencia del conductor:**
* R = (ρ × L) / S

**Resistividad corregida por temperatura:**
* ρ(T) = ρ₂₀ × [1 + α × (T - 20)]

**Reactancia inductiva del cable:**
* X = 2π × f × L_inductiva

**Impedancia total:**
* Z = √(R² + X²)

**Inductancia específica de cables (valores típicos):**
* Cables unipolares: L ≈ 0.3-0.4 mH/km
* Cables tripolares: L ≈ 0.08-0.15 mH/km

**Donde:**
* R = Resistencia en ohmios
* X = Reactancia inductiva en ohmios
* Z = Impedancia en ohmios
* ρ₂₀ = Resistividad a 20°C (Cobre: 0.017241 Ω×mm²/m)
* α = Coeficiente de temperatura (Cobre: 0.00393 /°C)
* f = Frecuencia en Hz
* L_inductiva = Inductancia por unidad de longitud

---

## 14. Corriente de Empleo y Distribución

### 14.1 Corriente de Empleo

**Variables de entrada:**
* **Tensión de funcionamiento:** Menú desplegable con opciones:
  * 380V / 220V
* **Factor de simultaneidad:** Campo de texto (valor "1+") con botón X

**Nota:** Esta pantalla requiere que el usuario agregue cargas usando el botón "+". La fórmula se aplicará a la suma de todas las cargas agregadas.

**Fórmulas:**

**Para sistema trifásico:**
* I_empleo = (Σ P_cargas × Factor_simultaneidad) / (√3 × V × cos φ_promedio)

**Para sistema monofásico:**
* I_empleo = (Σ P_cargas × Factor_simultaneidad) / (V × cos φ_promedio)

**Donde:**
* I_empleo = Corriente de empleo en amperios
* Σ P_cargas = Suma de todas las cargas conectadas
* Factor_simultaneidad = Factor que considera que no todas las cargas operan simultáneamente
* V = Tensión nominal del sistema
* cos φ_promedio = Factor de potencia promedio de las cargas

---

### 14.2 Corriente en Neutro

**Variables de entrada:**
* **Fase A:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Fase B:** Campo numérico con dropdown de unidades:
  * A (amperios)
* **Fase C:** Campo numérico con dropdown de unidades:
  * A (amperios)

**Fórmulas:**

**Para sistema trifásico balanceado:**
* I_neutro = 0 (teóricamente)

**Para sistema trifásico desbalanceado:**
* I_neutro = √[(I_A + I_B + I_C)² - 3×(I_A×I_B + I_B×I_C + I_C×I_A)]

**Método vectorial (considerando desfase de 120°):**
* I_neutro = √[I_A² + I_B² + I_C² + 2×I_A×I_B×cos(120°) + 2×I_B×I_C×cos(120°) + 2×I_C×I_A×cos(120°)]

**Simplificado:**
* I_neutro = √[I_A² + I_B² + I_C² - I_A×I_B - I_B×I_C - I_C×I_A]

**Donde:**
* I_neutro = Corriente en el conductor neutro
* I_A, I_B, I_C = Corrientes en cada fase
* cos(120°) = -0.5

---

### 14.3 Devanado Primario/Secundario del Transformador

**Variables de entrada:**
* **Calcular:** Menú desplegable con opciones:
  * Voltaje primario
* **Voltaje secundario:** Campo numérico con dropdown de unidades:
  * V (voltios)
* **Vueltas primario:** Campo nu