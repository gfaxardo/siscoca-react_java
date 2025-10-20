# 🎯 SISCOCA 2.0 - Sistema de Gestión de Campañas

![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)
![Vite](https://img.shields.io/badge/Vite-6.0-646cff)

Sistema moderno de gestión de campañas publicitarias desarrollado con React, TypeScript y Tailwind CSS v3.

## 📋 Características

### ✅ Funcionalidades Principales

- **Gestión de Campañas**: Crear, editar y eliminar campañas
- **Métricas de Trafficker**: Alcance, clics, leads, costos
- **Métricas del Dueño**: Conductores registrados y primer viaje
- **Dashboard Interactivo**: Visualización de estadísticas en tiempo real
- **Histórico Semanal**: Archivo automático de datos
- **Cálculos Automáticos**: Costos por lead y conductor
- **Estados de Campaña**: Pendiente, Creativo Enviado, Activa, Archivada

### 🎨 Diseño y UX

- **Interfaz Moderna**: UI/UX optimizada con Tailwind CSS v3
- **Responsive Design**: Adaptado a todos los dispositivos
- **Componentes Reutilizables**: Arquitectura modular
- **Validación de Formularios**: Con React Hook Form + Zod
- **Gestión de Estado**: Zustand con persistencia en localStorage

## 🚀 Tecnologías

- **React 18.3** - Framework UI
- **TypeScript 5.7** - Tipado estático
- **Tailwind CSS 3.4** - Framework CSS utility-first
- **Vite 6.0** - Build tool y dev server
- **Zustand 5.0** - Gestión de estado
- **React Hook Form 7.54** - Manejo de formularios
- **Zod 3.24** - Validación de esquemas
- **date-fns 4.1** - Manejo de fechas

## 📦 Instalación

### Requisitos Previos

- Node.js 18+ 
- npm o yarn

### Pasos de Instalación

```bash
# Clonar el repositorio
git clone <url-repositorio>

# Navegar al directorio
cd siscoca-react

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto

```
siscoca-react/
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Layout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── Campanas/
│   │   │   ├── ListaCampanas.tsx
│   │   │   ├── FormularioCrearCampana.tsx
│   │   │   ├── FormularioMetricasTrafficker.tsx
│   │   │   └── FormularioMetricasDueno.tsx
│   │   ├── Dashboard/
│   │   │   └── Dashboard.tsx
│   │   └── Historico/
│   │       └── VistaHistorico.tsx
│   ├── store/
│   │   └── useCampanaStore.ts
│   ├── types/
│   │   ├── campana.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## 📖 Uso del Sistema

### Crear Nueva Campaña

1. Ir a la vista "Campañas"
2. Clic en "Nueva Campaña"
3. Llenar el formulario con:
   - Nombre de campaña
   - Objetivo
   - Segmento (Adquisición, Retención, Retorno)
   - Vertical/Negocio
   - Beneficio/Programa
   - Descripción
4. Clic en "Crear Campaña"

### Subir Métricas del Trafficker

1. Seleccionar una campaña en estado "Activa"
2. Clic en "📊 Trafficker"
3. Completar:
   - URL del informe (opcional)
   - Alcance
   - Clics
   - Leads
   - Costo Semanal
   - Costo/Lead (opcional, se calcula automáticamente)
4. Clic en "Subir Métricas"

### Completar Métricas del Dueño

1. Seleccionar una campaña con métricas de trafficker
2. Clic en "👥 Dueño"
3. Ingresar:
   - Conductores Registrados
   - Conductores con Primer Viaje
4. Clic en "Completar Métricas"
5. Los costos se calculan automáticamente

### Estados de Campaña

- **Pendiente**: Campaña creada, esperando creativo
- **Creativo Enviado**: Creativo subido, esperando activación
- **Activa**: Campaña en ejecución, recibiendo métricas
- **Archivada**: Campaña archivada en histórico

## 🎨 Personalización

### Colores del Tema

Editar `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#2196f3', // Color principal
        600: '#1e88e5',
      }
    }
  }
}
```

### Segmentos Personalizados

Editar `src/types/campana.ts`:

```typescript
export type Segmento = 'Adquisición' | 'Retención' | 'Retorno' | 'Nuevo';
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview de build
npm run preview

# Linting
npm run lint
```

## 📊 Integración con Sistemas Mayores

Este módulo está diseñado para integrarse fácilmente en sistemas más grandes:

### Como Módulo Independiente

```jsx
import SiscocaApp from './siscoca-react/src/App';

function MainApp() {
  return (
    <div>
      <SiscocaApp />
    </div>
  );
}
```

### Con Routing

```jsx
import { Route } from 'react-router-dom';
import SiscocaApp from './siscoca-react/src/App';

<Route path="/campanas/*" element={<SiscocaApp />} />
```

## 🚀 Deploy

### Build para Producción

```bash
npm run build
```

Los archivos se generan en `/dist`

### Variables de Entorno

Crear archivo `.env`:

```env
VITE_API_URL=https://api.ejemplo.com
VITE_APP_TITLE=SISCOCA 2.0
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Equipo

Desarrollado para modernizar el sistema SISCOCA original de Google Apps Script.

---

**¿Preguntas o sugerencias?** Abre un issue en el repositorio.


