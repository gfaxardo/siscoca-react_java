# 🚀 Inicio Rápido - SISCOCA 2.0

## ⚡ Empezar en 3 Pasos

### 1. Instalar Dependencias

```bash
cd siscoca-react
npm install
```

### 2. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El proyecto se abrirá automáticamente en `http://localhost:3000`

### 3. Explorar el Sistema

La aplicación carga automáticamente con **datos de ejemplo** para que puedas probar todas las funcionalidades.

---

## 📱 Funcionalidades Disponibles

### ✅ Vista Dashboard
- **Estadísticas generales** de campañas
- **Métricas agregadas** de campañas activas
- **Top 5 campañas** por rendimiento

### ✅ Vista Campañas
- **Lista de campañas activas**
- **Crear nueva campaña**
- **Cambiar estados** (Pendiente → Creativo Enviado → Activa)
- **Subir métricas del trafficker**
- **Completar métricas del dueño**
- **Eliminar campañas**

### ✅ Vista Histórico
- **Archivo semanal** de campañas
- **Filtros y búsqueda** (próximamente)

---

## 🎯 Probar el Sistema

### 1. Ver Dashboard Inicial
Al abrir la app, verás 4 campañas de ejemplo con métricas reales.

### 2. Crear una Campaña
1. Ve a la pestaña **"🎯 Campañas"**
2. Clic en **"Nueva Campaña"**
3. Llena el formulario:
   - Nombre: "Campaña Test"
   - Objetivo: "Probar el sistema"
   - Segmento: "Adquisición"
   - Vertical: "Conductores"
   - Beneficio: "Bono de prueba"
   - Descripción: "Esta es una campaña de prueba"
4. Clic en **"Crear Campaña"**

### 3. Activar una Campaña
1. Encuentra una campaña en estado **"Pendiente"**
2. Clic en **"Creativo Enviado"**
3. Luego clic en **"Activar"**

### 4. Subir Métricas del Trafficker
1. En una campaña **"Activa"**, clic en **"📊 Trafficker"**
2. Completa los datos:
   - Alcance: 10000
   - Clics: 500
   - Leads: 50
   - Costo Semanal: 2500
3. Clic en **"Subir Métricas"**

### 5. Completar Métricas del Dueño
1. En la misma campaña, clic en **"👥 Dueño"**
2. Completa:
   - Conductores Registrados: 25
   - Conductores con Primer Viaje: 15
3. Clic en **"Completar Métricas"**
4. Los costos se calculan automáticamente

### 6. Ver Resultados en Dashboard
Regresa al **Dashboard** para ver las métricas actualizadas.

---

## 🔧 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build            # Genera build optimizado
npm run preview          # Preview del build

# Mantenimiento
npm run lint             # Revisa código con ESLint
```

---

## 📊 Datos de Ejemplo

El sistema incluye 4 campañas de ejemplo:

1. **Campaña Verano 2025** (Activa)
   - Segmento: Adquisición
   - Con métricas completas

2. **Retención Premium** (Activa)
   - Segmento: Retención
   - Con métricas completas

3. **Retorno Conductores Inactivos** (Creativo Enviado)
   - Segmento: Retorno
   - Sin métricas

4. **Campaña Facebook Ads** (Pendiente)
   - Segmento: Adquisición
   - Sin métricas

---

## 💾 Persistencia de Datos

Los datos se guardan automáticamente en **localStorage** del navegador.

### Resetear Datos

Para volver a los datos de ejemplo:

```javascript
// Abre la consola del navegador (F12) y ejecuta:
localStorage.clear();
location.reload();
```

---

## 🎨 Características Destacadas

### ✅ Diseño Responsive
Prueba el sistema en diferentes tamaños de pantalla:
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

### ✅ Validación de Formularios
Todos los campos tienen validación en tiempo real con mensajes de error claros.

### ✅ Cálculos Automáticos
- Costo/Lead se calcula automáticamente
- Costo/Conductor Registrado se calcula automáticamente
- Costo/Conductor Primer Viaje se calcula automáticamente

### ✅ Estados de Campaña
Flujo completo:
```
Pendiente → Creativo Enviado → Activa → Archivada
```

---

## 🐛 Solución de Problemas

### Puerto 3000 ocupado
```bash
# El puerto se puede cambiar en vite.config.ts
# O ejecutar:
PORT=3001 npm run dev
```

### Errores de compilación
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Datos no aparecen
```bash
# Verifica la consola del navegador (F12)
# Debería ver: "Datos de ejemplo cargados"
```

---

## 📚 Próximos Pasos

1. **Revisa el README.md** para documentación completa
2. **Lee INTEGRACION.md** para integrar en tu sistema
3. **Explora el código** en `/src`
4. **Personaliza los estilos** en `tailwind.config.js`

---

## 💡 Tips Rápidos

### Atajos de Teclado
- `F12` - Abrir DevTools
- `Ctrl + Shift + C` - Inspeccionar elemento

### Explorar la Estructura
```bash
# Ver estructura del proyecto
tree src/

# O en Windows
tree /f src
```

### Debug
La aplicación usa React DevTools. Instala la extensión para tu navegador:
- [Chrome/Edge](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

---

## 🎉 ¡Listo!

Ya puedes empezar a usar SISCOCA 2.0.

**¿Preguntas?** Revisa:
- README.md - Documentación general
- INTEGRACION.md - Guía de integración
- Código fuente en `/src`

---

**Desarrollado con ❤️ usando React + TypeScript + Tailwind CSS v3**


