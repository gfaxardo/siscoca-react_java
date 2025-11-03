# 📝 Gestión de Contraseñas en SISCOCA

## 🔑 Contraseña Por Defecto

**Todos los usuarios nuevos tienen la contraseña por defecto:**
```
siscoca2024
```

## 👥 Usuarios Iniciales del Sistema

Los siguientes usuarios se crean automáticamente al iniciar el backend:

### ADMIN
- **Usuario:** `gfajardo`
- **Contraseña:** `siscoca2024`
- **Nombre:** Gonzalo Fajardo
- **Iniciales:** GF

### MARKETING (MKT)
- **Usuario:** `acruz`
- **Contraseña:** `siscoca2024`
- **Nombre:** Ariana de la Cruz
- **Iniciales:** AC

### TRAFFICKER
- **Usuario:** `rortega`
- **Contraseña:** `siscoca2024`
- **Nombre:** Rayedel Ortega
- **Iniciales:** RO

### DUEÑOS
- **Usuario:** `gfajardo2` - Gonzalo Fajardo (GF) - `siscoca2024`
- **Usuario:** `fhuarilloclla` - Frank Huarilloclla (FH) - `siscoca2024`
- **Usuario:** `dvaldivia` - Diego Valdivia (DV) - `siscoca2024`
- **Usuario:** `mpineda` - Martha Pineda (MP) - `siscoca2024`
- **Usuario:** `jochoa` - Jhajaira Ochoa (JO) - `siscoca2024`

## 🔒 Seguridad de Contraseñas

### ¿Cómo se almacenan las contraseñas?

Las contraseñas se almacenan **encriptadas** con BCrypt. Esto significa:
- ✅ **Nunca se pueden recuperar** las contraseñas originales
- ✅ **Nadie puede ver** tu contraseña, ni siquiera los administradores
- ✅ **Es seguro** almacenar contraseñas en la base de datos

### ¿Qué pasa si olvido mi contraseña?

Si olvidas tu contraseña:
1. **Contacta al Administrador del sistema** (rol ADMIN)
2. El administrador puede **restablecer tu contraseña** desde:
   - Menú: **Gestión de Usuarios** (solo visible para ADMIN)
   - Acción: **Editar Usuario** → Ingresar nueva contraseña → Guardar

### ¿Puedo cambiar mi contraseña yo mismo?

Actualmente, **NO hay una función para que el usuario cambie su propia contraseña**. Esta funcionalidad podría agregarse en el futuro.

## 👨‍💼 Para Administradores

### Cómo restablecer la contraseña de un usuario:

1. Inicia sesión como **ADMIN**
2. Ve a **Gestión de Usuarios** (en el menú lateral)
3. Haz clic en **✏️ Editar** del usuario que necesitas
4. En el campo **"Nueva Contraseña"**, ingresa la nueva contraseña
5. Haz clic en **💾 Actualizar Usuario**

**Nota:** Si dejas el campo de contraseña vacío, la contraseña actual no se modificará.

### Crear un nuevo usuario:

1. En **Gestión de Usuarios**, haz clic en **➕ Nuevo Usuario**
2. Completa el formulario (contraseña es obligatoria para nuevos usuarios)
3. La contraseña se encriptará automáticamente al guardar

## 📋 Formato de Usuario y Contraseña

- **Username:** Generalmente es la inicial del nombre y apellido en minúsculas
  - Ejemplo: `gfajardo` (Gonzalo Fajardo)
- **Contraseña inicial:** `siscoca2024` (para todos los usuarios nuevos)
- **Recomendación:** Cambia la contraseña después del primer acceso si tienes acceso como ADMIN

## ⚠️ Importante

- **NUNCA compartas tu contraseña** con otros usuarios
- Si sospechas que tu contraseña fue comprometida, contacta al ADMIN inmediatamente
- Las contraseñas deben tener al menos 8 caracteres (recomendado)

---

**Última actualización:** Noviembre 2024

