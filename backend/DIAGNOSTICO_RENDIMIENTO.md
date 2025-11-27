# 🔍 DIAGNÓSTICO DE RENDIMIENTO - SISCOCA

## 📊 RESUMEN ACTUAL

- ✅ **59 índices creados** en la BD
- ✅ **JOIN FETCH** implementado en queries
- ✅ **Lazy loading** configurado correctamente
- ✅ Solo **16 campañas**, **6 históricos** (volumen bajo)
- ✅ Latencia de red a BD: ~1.4s (NORMAL)

---

## 🎯 PASOS PARA DIAGNOSTICAR LENTITUD

### **PASO 1: Reiniciar el Backend**

```bash
cd backend
./mvnw spring-boot:run
```

O si está corriendo en IntelliJ/VS Code, reinícialo.

---

### **PASO 2: Llamar al Endpoint de Diagnóstico**

Abre el navegador o Postman y haz GET a:

```
http://localhost:8081/api/diagnostico/rendimiento
```

**Respuesta esperada:**
```json
{
  "campanasCount": 16,
  "campanasTimeMs": 150,
  "historicoCount": 6,
  "historicoTimeMs": 80,
  "totalTimeMs": 230
}
```

📋 **Anota los tiempos que ves**

---

### **PASO 3: Identificar el Problema**

#### ✅ Si `campanasTimeMs` < 300ms y `historicoTimeMs` < 200ms:
**El backend está RÁPIDO**. El problema puede ser:
- Frontend parseando datos
- Renderizado de React lento
- Conexión de red del navegador

#### ⚠️ Si `campanasTimeMs` > 500ms:
**Query de campañas lenta**. Posibles causas:
- Índices no están siendo usados
- Conexión pool agotada
- Servidor BD sobrecargado

#### ⚠️ Si `historicoTimeMs` > 500ms:
**Query de histórico lenta**. Revisar JOIN FETCH.

---

### **PASO 4: Ver Logs SQL en Consola del Backend**

Cuando el backend está corriendo, **busca en la consola** líneas como:

```sql
Hibernate: select c1_0.id,...  (TIEMPO AQUÍ)
```

Los logs SQL muestran:
- ✅ Si usa índices: `Index Scan using idx_xxx`
- ❌ Si NO usa índices: `Seq Scan on campanas`

---

## 🔧 OPTIMIZACIONES ADICIONALES POSIBLES

### **1. Pool de Conexiones**

Si ves muchos `Acquiring connection` en logs:

**application.yml:**
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
```

---

### **2. Caché de Segundo Nivel (Hibernate)**

Para datos que NO cambian mucho:

**application.yml:**
```yaml
spring:
  jpa:
    properties:
      hibernate:
        cache:
          use_second_level_cache: true
          region.factory_class: org.hibernate.cache.jcache.JCacheRegionFactory
```

---

### **3. Proyecciones (DTOs Optimizados)**

En vez de traer TODO el entity:

```java
// Actual (trae TODO)
@Query("SELECT c FROM Campana c")
List<Campana> findAll();

// Optimizado (solo campos necesarios)
@Query("SELECT new com.siscoca.dto.CampanaDto(c.id, c.nombre, ...) FROM Campana c")
List<CampanaDto> findAllOptimized();
```

---

### **4. Paginación**

Si tendrás cientos de campañas:

```java
@GetMapping
public ResponseEntity<Page<CampanaDto>> getAllCampanas(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
) {
    Pageable pageable = PageRequest.of(page, size);
    Page<CampanaDto> campanas = campanaService.getAllCampanas(pageable);
    return ResponseEntity.ok(campanas);
}
```

---

### **5. Compresión GZIP (Backend → Frontend)**

**application.yml:**
```yaml
server:
  compression:
    enabled: true
    mime-types: application/json,application/xml,text/html,text/xml,text/plain
    min-response-size: 1024
```

---

## 🐛 TROUBLESHOOTING

### **Problema: "Sigue lento después de índices"**

1. ✅ Verifica que los índices se estén USANDO:

```sql
-- Ver plan de ejecución de una query
EXPLAIN ANALYZE 
SELECT * FROM campanas WHERE estado = 'Activa';
```

Debe decir: `Index Scan using idx_campanas_estado`
NO debe decir: `Seq Scan on campanas` ❌

2. ✅ Actualiza estadísticas de PostgreSQL:

```sql
VACUUM ANALYZE campanas;
VACUUM ANALYZE historico_semanal;
```

3. ✅ Verifica conexión de red:

```bash
ping 168.119.226.236
```

Latencia debe ser < 100ms

---

### **Problema: "Frontend sigue lento"**

El problema puede NO ser el backend. Verifica:

1. **React DevTools → Profiler**
   - ¿Qué componente tarda más en renderizar?

2. **Network Tab (F12)**
   - ¿Cuánto tarda la llamada API?
   - ¿Es `Waiting (TTFB)` o `Content Download`?

3. **Console (F12)**
   - ¿Hay errores o warnings?

4. **Performance Tab (F12)**
   - ¿Dónde está el cuello de botella?

---

## 📈 MÉTRICAS OBJETIVO

| Métrica | Objetivo | Actual |
|---------|----------|--------|
| Login | < 150ms | ? |
| GET /campanas | < 300ms | ? |
| GET /historico | < 200ms | ? |
| Dashboard (total) | < 1s | ? |

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Reiniciar backend
- [ ] Llamar `/api/diagnostico/rendimiento`
- [ ] Anotar tiempos
- [ ] Ver logs SQL en consola
- [ ] Verificar que índices se usan
- [ ] Probar desde Network Tab (F12)
- [ ] Identificar si es backend o frontend

---

## 📞 SIGUIENTE PASO

**COMPARTE LOS RESULTADOS DE:**
1. `/api/diagnostico/rendimiento` (JSON response)
2. Network Tab: tiempo de `GET /api/campanas`
3. Network Tab: tiempo de `GET /api/historico`

Con esos datos podremos identificar EXACTAMENTE dónde está el problema.

