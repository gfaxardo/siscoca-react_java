# 🔌 Guía de Integración - SISCOCA 2.0

## Integración como Módulo en un Sistema Mayor

Esta guía explica cómo integrar SISCOCA 2.0 como módulo dentro de un sistema React más grande.

---

## 📦 Opción 1: Integración Directa

### Paso 1: Copiar el Módulo

Copiar la carpeta `siscoca-react/src` a tu proyecto:

```
tu-proyecto/
├── src/
│   ├── modules/
│   │   └── siscoca/
│   │       ├── components/
│   │       ├── store/
│   │       ├── types/
│   │       └── SiscocaModule.tsx
```

### Paso 2: Instalar Dependencias

```bash
npm install zustand react-hook-form zod @hookform/resolvers date-fns
```

### Paso 3: Configurar Tailwind

En tu `tailwind.config.js`, añade las rutas del módulo:

```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./src/modules/siscoca/**/*.{js,jsx,ts,tsx}", // Añadir esta línea
  ],
  // ... resto de configuración
}
```

### Paso 4: Integrar en tu App

```tsx
// En tu archivo principal
import SiscocaModule from './modules/siscoca/SiscocaModule';

function App() {
  return (
    <div>
      <YourHeader />
      <SiscocaModule />
      <YourFooter />
    </div>
  );
}
```

---

## 🚀 Opción 2: Module Federation (Micro-frontend)

Para proyectos más grandes con múltiples equipos.

### Configuración del Módulo SISCOCA

**vite.config.ts** (SISCOCA):

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'siscoca',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './Store': './src/store/useCampanaStore',
      },
      shared: ['react', 'react-dom', 'zustand']
    })
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false
  }
});
```

### Consumir desde tu App Principal

**vite.config.ts** (App Principal):

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        siscoca: 'http://localhost:3001/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'zustand']
    })
  ]
});
```

**Uso en tu código:**

```tsx
import React, { lazy, Suspense } from 'react';

const SiscocaApp = lazy(() => import('siscoca/App'));

function MainApp() {
  return (
    <Suspense fallback={<div>Cargando SISCOCA...</div>}>
      <SiscocaApp />
    </Suspense>
  );
}
```

---

## 🔀 Opción 3: Con React Router

### Configuración de Rutas

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SiscocaApp from './modules/siscoca/App';
import MainDashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainDashboard />} />
        <Route path="/campanas/*" element={<SiscocaApp />} />
        <Route path="/reportes" element={<Reportes />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 🎨 Personalización de Estilos

### Usar el Theme de tu Sistema

```tsx
// ThemeProvider.tsx
import { createContext, useContext } from 'react';

const ThemeContext = createContext({
  primaryColor: '#2196f3',
  secondaryColor: '#34a853',
});

export const useTheme = () => useContext(ThemeContext);

// Usar en componentes de SISCOCA
function ComponenteSiscoca() {
  const theme = useTheme();
  
  return (
    <button style={{ backgroundColor: theme.primaryColor }}>
      Acción
    </button>
  );
}
```

### Tailwind con Prefijo

Si quieres evitar conflictos de estilos:

```javascript
// tailwind.config.js
module.exports = {
  prefix: 'siscoca-',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // ...
}
```

Uso en componentes:

```tsx
<div className="siscoca-bg-blue-500 siscoca-p-4">
  Contenido
</div>
```

---

## 🔐 Compartir Estado Global

### Opción A: Context API del Padre

```tsx
// En tu app principal
import { CampanaProvider } from './contexts/CampanaContext';
import SiscocaApp from './modules/siscoca/App';

function App() {
  return (
    <CampanaProvider>
      <SiscocaApp />
      <OtrosModulos />
    </CampanaProvider>
  );
}
```

### Opción B: Store Compartido

```tsx
// store/globalStore.ts
import { create } from 'zustand';
import { useCampanaStore } from './modules/siscoca/store/useCampanaStore';

export const useGlobalStore = create((set, get) => ({
  // Tu estado global
  user: null,
  
  // Acceso al store de SISCOCA
  campanas: useCampanaStore.getState().campanas,
  
  // Métodos compartidos
  sincronizarCampanas: () => {
    const campanas = useCampanaStore.getState().campanas;
    set({ campanas });
  }
}));
```

---

## 🌐 API Backend Compartida

### Configurar API Base URL

```tsx
// config/api.ts
export const API_CONFIG = {
  baseURL: process.env.VITE_API_URL || 'http://localhost:4000',
  endpoints: {
    campanas: '/api/campanas',
    metricas: '/api/metricas',
    historico: '/api/historico'
  }
};
```

### Adaptar el Store para usar API

```tsx
// store/useCampanaStore.ts
import { API_CONFIG } from '../config/api';

export const useCampanaStore = create<CampanaStore>((set) => ({
  campanas: [],
  
  crearCampana: async (datos) => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.campanas}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      
      const nuevaCampana = await response.json();
      set((state) => ({
        campanas: [...state.campanas, nuevaCampana]
      }));
      
      return { exito: true, mensaje: 'Campaña creada' };
    } catch (error) {
      return { exito: false, mensaje: error.message };
    }
  }
}));
```

---

## 📊 Compartir Datos entre Módulos

### Event Bus

```tsx
// utils/eventBus.ts
type EventCallback = (data: any) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  on(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event: string, data?: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event: string, callback: EventCallback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

export const eventBus = new EventBus();
```

**Uso:**

```tsx
// En SISCOCA
import { eventBus } from '../utils/eventBus';

function crearCampana(datos) {
  // ... lógica
  eventBus.emit('campana:creada', nuevaCampana);
}

// En otro módulo
import { eventBus } from './utils/eventBus';

useEffect(() => {
  const handleCampanaCreada = (campana) => {
    console.log('Nueva campaña:', campana);
  };
  
  eventBus.on('campana:creada', handleCampanaCreada);
  
  return () => {
    eventBus.off('campana:creada', handleCampanaCreada);
  };
}, []);
```

---

## 🔒 Autenticación y Permisos

### Proteger Rutas

```tsx
// components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, requiredPermission }) {
  const user = useAuth();
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredPermission && !user.permissions.includes(requiredPermission)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
}

// Uso
<Route 
  path="/campanas/*" 
  element={
    <ProtectedRoute requiredPermission="campanas.view">
      <SiscocaApp />
    </ProtectedRoute>
  } 
/>
```

---

## 📱 Responsive y Mobile

El módulo ya está optimizado para responsive, pero puedes ajustarlo:

```tsx
// hooks/useBreakpoint.ts
import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('desktop');
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setBreakpoint('mobile');
      else if (window.innerWidth < 1024) setBreakpoint('tablet');
      else setBreakpoint('desktop');
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return breakpoint;
}
```

---

## 🧪 Testing

### Setup de Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**vitest.config.ts:**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

---

## 📝 Ejemplo Completo de Integración

```tsx
// App.tsx - Sistema Principal
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import SiscocaApp from './modules/siscoca/App';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route 
                path="/campanas/*" 
                element={
                  <ProtectedRoute permission="campanas.view">
                    <SiscocaApp />
                  </ProtectedRoute>
                } 
              />
              <Route path="/reportes" element={<Reportes />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
```

---

## 🚀 Despliegue

### Build del Módulo

```bash
cd siscoca-react
npm run build
```

### Servir como Microfrontend

```bash
npm run preview
# O con servidor estático
npx serve -s dist -p 3001
```

---

## 📞 Soporte

Para problemas de integración, revisa:
1. Esta guía de integración
2. El README.md principal
3. Los ejemplos en `/examples`

---

**¡Listo para integrar SISCOCA 2.0 en tu sistema!** 🎯


