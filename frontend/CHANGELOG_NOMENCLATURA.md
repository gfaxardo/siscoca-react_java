# 🎯 Changelog - Sistema de Nomenclatura Automática

## 📋 Versión 2.1.0 - Nomenclatura Inteligente

### ✨ Mejoras Implementadas

#### 1. **Sistema de Nomenclatura Automática**

Se implementó un sistema profesional de generación automática de nombres de campañas con la siguiente estructura:

```
[PAÍS]-[VERTICAL]-[PLATAFORMA]-[SEGMENTO]-[ID]-[DUEÑO]-[DESCRIPCIÓN]

Ejemplo:
PE-MOTOPER-FB-ADQ-001-GF-Verano2025
```

#### 2. **Componentes del Nombre**

**PAÍS** (2 letras):
- `PE` = Perú
- `CO` = Colombia

**VERTICAL** (códigos específicos):
- `MOTOPER` = Moto Persona
- `MOTODEL` = Moto Delivery
- `CARGO` = Cargo
- `AUTOPER` = Auto Persona
- `B2B` = B2B
- `PREMIER` = Premier
- `CONFORT` = Confort
- `YEGOPRO` = YegoPro
- `YEGOMIAUTO` = YegoMiAuto
- `YEGOMIMOTO` = YegoMiMoto

**PLATAFORMA** (2 letras):
- `FB` = Facebook Ads
- `TT` = TikTok Ads
- `IG` = Instagram Ads
- `GG` = Google Ads
- `LI` = LinkedIn Ads

**SEGMENTO** (3 letras):
- `ADQ` = Adquisición
- `RET` = Retención
- `RTO` = Retorno

**ID INTERNO**:
- Auto-generado: 001, 002, 003...

**INICIALES DUEÑO**:
- 2-3 letras en mayúsculas (ej: GF, JL, MR)

**DESCRIPCIÓN CORTA**:
- Texto libre sin espacios, máx. 20 caracteres
- Ejemplos: Verano2025, BlackFriday, Promo50

---

### 📝 Nuevo Formulario de Creación

#### Campos Agregados:

1. **País** - Dropdown con PE/CO
2. **Vertical** - Dropdown con 10 opciones
3. **Plataforma** - Dropdown con 5 opciones principales
4. **Segmento** - Dropdown con 3 opciones
5. **Iniciales Dueño** - Input de 2-3 letras (validado)
6. **ID Plataforma Externa** - Opcional, para tracking
7. **Descripción Corta** - Sin espacios, para identificación rápida

#### Campos Mantenidos:

- Objetivo
- Beneficio/Programa
- Descripción Detallada

#### Campos Removidos:

- ~~Nombre de Campaña~~ (ahora autogenerado)
- ~~Vertical/Negocio~~ (ahora es dropdown estructurado)

---

### 🎨 Mejoras Visuales

#### Preview en Tiempo Real

El formulario muestra un preview del nombre que se generará:

```
┌─────────────────────────────────────────────────┐
│ 📝 Nombre de Campaña (Generado Automáticamente)│
│                                                 │
│  PE-MOTOPER-FB-ADQ-001-GF-Verano2025           │
└─────────────────────────────────────────────────┘
```

#### Tarjetas de Campaña Mejoradas

Las tarjetas ahora muestran:
- **Nombre completo** autogenerado (break-words para no cortar)
- **Badge con ID** interno (#001)
- **Badge con dueño** (👤 GF)
- **Badge con ID externo** (🔗 123456789) - si existe
- Estado visual con colores

---

### 🔧 Cambios Técnicos

#### Tipos TypeScript Actualizados

```typescript
export interface Campana {
  id: string;
  nombre: string;              // Autogenerado
  pais: Pais;                 // 'PE' | 'CO'
  vertical: Vertical;          // 'MOTOPER' | 'CARGO' | ...
  plataforma: Plataforma;      // 'FB' | 'TT' | ...
  segmento: Segmento;
  idPlataformaExterna?: string;
  inicialesDueno: string;
  descripcionCorta: string;
  // ... resto de campos
}
```

#### Validaciones Agregadas

- **Iniciales Dueño**: 2-3 letras mayúsculas (regex: `^[A-Z]+$`)
- **Descripción Corta**: Sin espacios (regex: `^[a-zA-Z0-9]+$`)
- **País/Vertical/Plataforma**: Enums estrictos con Zod

#### Store Actualizado

La función `crearCampana` ahora:
1. Genera el ID interno con padding (001, 002, ...)
2. Construye el nombre automáticamente
3. Convierte iniciales a mayúsculas
4. Almacena todos los campos nuevos

---

### 📊 Ejemplos de Nomenclatura

#### Perú - Moto Persona - Facebook - Adquisición
```
PE-MOTOPER-FB-ADQ-001-GF-Verano2025
```

#### Colombia - Cargo - TikTok - Retención
```
CO-CARGO-TT-RET-002-JL-Fidelizacion
```

#### Perú - Premier - Instagram - Retorno
```
PE-PREMIER-IG-RTO-003-MR-Reactivacion
```

#### Colombia - Auto Persona - Google - Adquisición
```
CO-AUTOPER-GG-ADQ-004-AS-Expansion
```

---

### 🎯 Beneficios

1. **Identificación Rápida**: Nombre descriptivo con toda la info clave
2. **Consistencia**: Formato estandarizado en todas las campañas
3. **Trazabilidad**: ID interno + ID externo + dueño
4. **Búsqueda Fácil**: Puedes filtrar por país, vertical, plataforma
5. **Profesionalismo**: Nomenclatura de nivel empresarial

---

### 📱 Uso del Nuevo Sistema

#### Crear una Campaña:

1. Ir a **"🎯 Campañas"**
2. Clic en **"📝 Nueva Campaña"**
3. Llenar los campos del formulario:
   - Seleccionar **País** (PE/CO)
   - Seleccionar **Vertical** (MOTOPER, CARGO, etc.)
   - Seleccionar **Plataforma** (FB, TT, IG, GG, LI)
   - Seleccionar **Segmento** (Adquisición/Retención/Retorno)
   - Ingresar **Iniciales** (2-3 letras, ej: GF)
   - Ingresar **ID externo** (opcional, ej: 123456789)
   - Ingresar **Descripción corta** (ej: Verano2025)
   - Completar objetivo, beneficio y descripción detallada
4. Ver el **preview del nombre** en tiempo real
5. Clic en **"Crear Campaña"**

#### Nombre Generado Automáticamente:
```
PE-MOTOPER-FB-ADQ-005-GF-Verano2025
```

---

### 🔄 Migración de Datos

Los datos de ejemplo se actualizaron con el nuevo formato:

**Antes:**
```
C1 - Campaña Verano 2025
```

**Ahora:**
```
001 - PE-MOTOPER-FB-ADQ-001-GF-Verano2025
```

---

### 🐛 Validaciones y Mensajes de Error

El formulario incluye validaciones robustas:

- ✅ País, Vertical, Plataforma y Segmento son obligatorios
- ✅ Iniciales deben ser 2-3 letras mayúsculas
- ✅ Descripción corta sin espacios ni caracteres especiales
- ✅ ID externo es opcional
- ✅ Objetivo mínimo 10 caracteres
- ✅ Beneficio y descripción son obligatorios

---

### 📈 Próximas Mejoras Sugeridas

1. **Filtros por componentes**:
   - Filtrar por país
   - Filtrar por vertical
   - Filtrar por plataforma
   - Filtrar por dueño

2. **Búsqueda inteligente**:
   - Buscar por cualquier parte del nombre
   - Sugerencias mientras escribes

3. **Reportes por estructura**:
   - Métricas agrupadas por vertical
   - Comparativa entre plataformas
   - Rendimiento por dueño

4. **Exportación**:
   - Exportar con nomenclatura estructurada
   - CSV con columnas separadas

---

### 🎉 Resultado

El sistema ahora genera nombres profesionales, consistentes y descriptivos que facilitan:
- ✅ Identificación rápida de campañas
- ✅ Trazabilidad completa
- ✅ Organización por múltiples criterios
- ✅ Integración con herramientas externas
- ✅ Reportes más precisos

---

**Versión:** 2.1.0  
**Fecha:** 17 Octubre 2025  
**Autor:** Sistema SISCOCA 2.0  


