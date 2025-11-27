import { useState, useEffect } from 'react';
import { usuarioService, CreateUsuarioRequest, UpdateUsuarioRequest, RolOption } from '../../services/usuarioService';
import { Usuario, RolUsuario } from '../../types/campana';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  Key, 
  Type, 
  Save, 
  X, 
  Loader2, 
  UserCog,
  Users as UsersIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ROLES_POR_DEFECTO: RolOption[] = [
  { codigo: 'ADMIN', nombre: 'Admin' },
  { codigo: 'TRAFFICKER', nombre: 'Trafficker' },
  { codigo: 'DUEÑO', nombre: 'Dueño' },
  { codigo: 'MKT', nombre: 'Marketing' }
];

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rolesDisponibles, setRolesDisponibles] = useState<RolOption[]>(ROLES_POR_DEFECTO);
  const [cargandoRoles, setCargandoRoles] = useState(false);
  
  // Formulario
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nombre: '',
    iniciales: '',
    rol: 'Marketing' as RolUsuario,
    activo: true
  });

  useEffect(() => {
    cargarUsuarios();
    cargarRoles();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);
      const usuariosData = await usuarioService.getAllUsuarios();
      setUsuarios(usuariosData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando usuarios');
    } finally {
      setCargando(false);
    }
  };

  const cargarRoles = async () => {
    try {
      setCargandoRoles(true);
      const roles = await usuarioService.getRolesDisponibles();
      if (roles.length > 0) {
        setRolesDisponibles(roles);
        setFormData((prev) => ({
          ...prev,
          rol: roles.some((rol) => rol.nombre === prev.rol) ? prev.rol : roles[0].nombre
        }));
      }
    } catch (err) {
      console.error('Error cargando roles disponibles:', err);
    } finally {
      setCargandoRoles(false);
    }
  };

  const handleCrearUsuario = () => {
    setUsuarioEditando(null);
    setFormData({
      username: '',
      password: '',
      nombre: '',
      iniciales: '',
      rol: rolesDisponibles[0]?.nombre ?? 'Marketing',
      activo: true
    });
    setMostrarFormulario(true);
  };

  const handleEditarUsuario = (usuario: Usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      username: usuario.username,
      password: '', // No mostrar password
      nombre: usuario.nombre,
      iniciales: usuario.iniciales,
      rol: rolesDisponibles.some((rol) => rol.nombre === usuario.rol)
        ? usuario.rol
        : rolesDisponibles[0]?.nombre ?? 'Marketing',
      activo: true
    });
    setMostrarFormulario(true);
  };

  const handleEliminarUsuario = async (id: string) => {
    if (!window.confirm('¿Estás seguro de que quieres desactivar este usuario?')) {
      return;
    }

    try {
      await usuarioService.deleteUsuario(id);
      await cargarUsuarios();
      alert('✅ Usuario desactivado correctamente');
    } catch (err) {
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleSubmitFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (usuarioEditando) {
        // Actualizar usuario existente
        const updateData: UpdateUsuarioRequest = {
          nombre: formData.nombre,
          iniciales: formData.iniciales,
          rol: formData.rol,
          activo: formData.activo
        };
        
        // Solo incluir password si se proporcionó uno
        if (formData.password && formData.password.trim() !== '') {
          updateData.password = formData.password;
        }

        await usuarioService.updateUsuario(usuarioEditando.id, updateData);
        alert('✅ Usuario actualizado correctamente');
      } else {
        // Crear nuevo usuario
        if (!formData.password || formData.password.trim() === '') {
          alert('❌ La contraseña es requerida para nuevos usuarios');
          return;
        }

        const createData: CreateUsuarioRequest = {
          username: formData.username,
          password: formData.password,
          nombre: formData.nombre,
          iniciales: formData.iniciales.toUpperCase(),
          rol: formData.rol,
          activo: true
        };

        await usuarioService.createUsuario(createData);
        alert('✅ Usuario creado correctamente');
      }

      setMostrarFormulario(false);
      await cargarUsuarios();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando usuario');
      alert(`❌ Error: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const getRoleBadgeColor = (rol: RolUsuario) => {
    switch (rol) {
      case 'Admin':
        return 'bg-red-100 text-red-800';
      case 'Trafficker':
        return 'bg-blue-100 text-blue-800';
      case 'Dueño':
        return 'bg-green-100 text-green-800';
      case 'Marketing':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-900 mb-2">Cargando usuarios...</p>
          <p className="text-sm text-gray-600 font-medium">Por favor espera un momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header moderno con estadísticas */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-6 lg:p-8 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
            >
              <UserCog className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-white">
                Gestión de Usuarios
              </h1>
              <p className="text-gray-400 text-sm lg:text-base font-medium">
                {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''} registrado{usuarios.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleCrearUsuario}
            className="px-6 py-3.5 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap transform hover:-translate-y-0.5 hover:scale-105"
            style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
          >
            <UserPlus className="w-5 h-5" />
            Nuevo Usuario
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 text-red-800 shadow-sm flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {usuarios.length === 0 ? (
          <div className="p-16 text-center">
            <div 
              className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #6b7280, #4b5563)' }}
            >
              <UsersIcon className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No hay usuarios registrados</h3>
            <p className="text-gray-600 text-base font-medium mb-6">Comienza creando el primer usuario del sistema</p>
            <button
              onClick={handleCrearUsuario}
              className="px-8 py-4 text-white rounded-xl font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2 transform hover:scale-105"
              style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
            >
              <UserPlus className="w-5 h-5" />
              Crear Primer Usuario
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Usuario
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <UsersIcon className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Nombre
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Type className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Iniciales
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Rol
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shadow-md mr-3"
                          style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
                        >
                          <span className="text-sm font-bold text-white">
                            {usuario.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{usuario.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {usuario.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-bold">
                        {usuario.iniciales}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold ${getRoleBadgeColor(usuario.rol)}`}>
                        <Shield className="w-3.5 h-3.5" />
                        {usuario.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditarUsuario(usuario)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all duration-200 shadow hover:shadow-md flex items-center gap-2"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleEliminarUsuario(usuario.id)}
                          className="px-4 py-2 text-white rounded-lg font-bold transition-all duration-200 shadow hover:shadow-md flex items-center gap-2"
                          style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Desactivar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] flex flex-col overflow-hidden">
            {/* Header del modal */}
            <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md"
                    style={{ background: 'linear-gradient(to bottom right, #ef0000, #dc0000)' }}
                  >
                    {usuarioEditando ? <Edit className="w-5 h-5 text-white" /> : <UserPlus className="w-5 h-5 text-white" />}
                  </div>
                  <h3 className="text-white text-lg font-bold">
                    {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
                  </h3>
                </div>
                <button
                  onClick={() => setMostrarFormulario(false)}
                  className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                  aria-label="Cerrar formulario"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Contenido con scroll */}
            <div className="overflow-y-auto flex-1">
              <form onSubmit={handleSubmitFormulario} className="p-6 space-y-5">
                {!usuarioEditando && (
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <User className="w-4 h-4" style={{ color: '#ef0000' }} />
                      Username *
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium text-sm hover:border-gray-400"
                      placeholder="nombre.usuario"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Key className="w-4 h-4" style={{ color: '#ef0000' }} />
                    {usuarioEditando ? 'Nueva Contraseña (opcional)' : 'Contraseña *'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium text-sm hover:border-gray-400"
                    placeholder={usuarioEditando ? "Dejar vacío para no cambiar" : "••••••••"}
                    required={!usuarioEditando}
                  />
                  {usuarioEditando && (
                    <p className="text-xs text-gray-600 mt-2 font-medium">Dejar vacío para mantener la contraseña actual</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <UsersIcon className="w-4 h-4" style={{ color: '#ef0000' }} />
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium text-sm hover:border-gray-400"
                    placeholder="Juan Pérez"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Type className="w-4 h-4" style={{ color: '#ef0000' }} />
                    Iniciales *
                  </label>
                  <input
                    type="text"
                    value={formData.iniciales}
                    onChange={(e) => setFormData({ ...formData, iniciales: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase transition-all font-medium text-sm hover:border-gray-400"
                    maxLength={10}
                    placeholder="JP"
                    required
                  />
                  <p className="text-xs text-gray-600 mt-2 font-medium flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                    Se convertirán automáticamente a mayúsculas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" style={{ color: '#ef0000' }} />
                    Rol *
                  </label>
                  <select
                    value={formData.rol}
                    onChange={(e) => setFormData({ ...formData, rol: e.target.value as RolUsuario })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium text-sm bg-white hover:border-gray-400"
                    disabled={cargandoRoles}
                    required
                  >
                    {rolesDisponibles.map((rol) => (
                      <option key={rol.codigo} value={rol.nombre}>
                        {rol.nombre}
                      </option>
                    ))}
                  </select>
                  {cargandoRoles && (
                    <p className="text-xs text-gray-600 mt-2 font-medium flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      Cargando roles disponibles...
                    </p>
                  )}
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 font-bold transition-all duration-200 shadow hover:shadow-md flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:w-auto px-8 py-3 text-white rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(to right, #ef0000, #dc0000)' }}
                  >
                    <Save className="w-5 h-5" />
                    {usuarioEditando ? 'Actualizar' : 'Crear'} Usuario
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

