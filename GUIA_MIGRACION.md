# 📊 Guía de Migración: Google Sheets → SISCOCA React

## 🎯 Pasos para Migrar tus Campañas

### 1. **Preparar Datos en Google Sheets**

#### Opción A: Exportar directamente
1. Ve a tu Google Sheet de SISCOCA
2. Selecciona todas las campañas (incluyendo headers)
3. **Archivo → Descargar → Valores separados por comas (.csv)**

#### Opción B: Crear archivo manual
Si prefieres crear el archivo manualmente, usa esta estructura:

```csv
id,nombre,pais,vertical,plataforma,segmento,idPlataformaExterna,inicialesDueno,descripcionCorta,objetivo,beneficio,descripcion,estado,fechaCreacion,alcance,clics,leads,costoSemanal,costoLead,conductoresRegistrados,conductoresPrimerViaje,costoConductorRegistrado,costoConductorPrimerViaje,urlInforme
001,PE-MOTOPER-FB-ADQ-001-GF-Verano2025,PE,MOTOPER,FB,Adquisición,123456789,GF,Verano2025,Aumentar registros de conductores,Bono de bienvenida S/50,Campaña de verano,Pendiente,2025-01-01,100000,5000,500,2500,5,250,150,10,16.67,https://facebook.com/report/123
```

### 2. **Mapear Columnas**

| Campo | Descripción | Valores Permitidos | Requerido |
|-------|-------------|-------------------|-----------|
| `id` | ID único de la campaña | 001, 002, etc. | ✅ |
| `nombre` | Nombre de la campaña | Cualquier texto | ✅ |
| `pais` | País de la campaña | PE, CO | ✅ |
| `vertical` | Vertical del negocio | MOTOPER, MOTODEL, CARGO, AUTOPER, B2B, PREMIER, CONFORT, YEGOPRO, YEGOMIAUTO, YEGOMIMOTO | ✅ |
| `plataforma` | Plataforma de publicidad | FB, TT, IG, GG, LI | ✅ |
| `segmento` | Tipo de campaña | Adquisición, Retención, Retorno | ✅ |
| `idPlataformaExterna` | ID en Facebook/TikTok | Cualquier texto | ❌ |
| `inicialesDueno` | Iniciales del dueño | 2-3 letras | ✅ |
| `descripcionCorta` | Descripción breve | Cualquier texto | ✅ |
| `objetivo` | Objetivo de la campaña | Cualquier texto | ✅ |
| `beneficio` | Beneficio ofrecido | Cualquier texto | ❌ |
| `descripcion` | Descripción completa | Cualquier texto | ❌ |
| `estado` | Estado actual | Pendiente, Creativo Enviado, Activa, Completada, Archivada | ❌ |
| `fechaCreacion` | Fecha de creación | YYYY-MM-DD | ❌ |

### 3. **Proceso de Importación**

1. **Abrir SISCOCA React**
   - Ve a `http://localhost:3000`
   - Haz clic en "📊 Importar Campañas"

2. **Descargar Plantilla**
   - Haz clic en "📄 Descargar Plantilla CSV"
   - Usa esta plantilla como referencia

3. **Subir Archivo**
   - Haz clic en "Selecciona archivo CSV o Excel"
   - Sube tu archivo exportado de Google Sheets

4. **Revisar Vista Previa**
   - Verifica que los datos se muestren correctamente
   - Revisa cualquier error reportado

5. **Confirmar Importación**
   - Haz clic en "Importar X Campañas"
   - Espera a que se complete el proceso

### 4. **Validaciones Automáticas**

El sistema validará automáticamente:
- ✅ **IDs únicos**: No se permiten IDs duplicados
- ✅ **Campos requeridos**: id, nombre, objetivo deben estar presentes
- ✅ **Valores válidos**: País, vertical, plataforma deben ser valores permitidos
- ✅ **Formato de fechas**: DD/MM/YYYY o YYYY-MM-DD
- ✅ **Números**: Alcance, clics, leads, costos deben ser números válidos

### 5. **Manejo de Errores**

Si hay errores durante la importación:
- **Revisa la lista de errores** mostrada en pantalla
- **Corrige el archivo CSV** con los datos faltantes o incorrectos
- **Vuelve a subir** el archivo corregido

### 6. **Post-Importación**

Después de importar exitosamente:
- ✅ **Verifica las campañas** en la lista principal
- ✅ **Revisa los filtros** para encontrar campañas específicas
- ✅ **Sube creativos** a las campañas que estén en estado "Pendiente"
- ✅ **Activa campañas** que tengan creativo subido
- ✅ **Sube métricas** a las campañas activas

## 🔧 Solución de Problemas

### Error: "Número de columnas incorrecto"
- **Causa**: El archivo CSV tiene filas con diferente número de columnas
- **Solución**: Revisa que todas las filas tengan el mismo número de campos

### Error: "Faltan datos requeridos"
- **Causa**: Campos obligatorios están vacíos
- **Solución**: Completa los campos id, nombre, objetivo en todas las filas

### Error: "Valor no válido para [campo]"
- **Causa**: El valor no está en la lista de valores permitidos
- **Solución**: Revisa las tablas de valores permitidos arriba

### Error: "ID ya existe"
- **Causa**: Hay IDs duplicados en el archivo
- **Solución**: Asegúrate de que cada campaña tenga un ID único

## 💡 Consejos Adicionales

1. **Haz una copia de seguridad** de tu Google Sheet antes de exportar
2. **Importa en lotes pequeños** si tienes muchas campañas (máximo 50 por vez)
3. **Usa la plantilla** como referencia para el formato correcto
4. **Verifica los datos** después de cada importación
5. **Mantén un registro** de qué campañas se importaron exitosamente

## 📞 Soporte

Si encuentras problemas durante la migración:
1. Revisa esta guía primero
2. Verifica el formato de tu archivo CSV
3. Usa la plantilla de ejemplo como referencia
4. Contacta al equipo de desarrollo si persisten los problemas

---

**¡Listo para migrar! 🚀** Sigue estos pasos y tendrás todas tus campañas funcionando en el nuevo sistema en minutos.

