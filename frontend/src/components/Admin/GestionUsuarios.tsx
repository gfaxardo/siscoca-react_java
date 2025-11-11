import { useState, useEffect } from 'react';
import { usuarioService, CreateUsuarioRequest, UpdateUsuarioRequest, RolOption } from '../../services/usuarioService';
import { Usuario, RolUsuario } from '../../types/campana';

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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end items-center">
        <button
          onClick={handleCrearUsuario}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          ➕ Nuevo Usuario
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuario
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Iniciales
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {usuario.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.nombre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.iniciales}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(usuario.rol)}`}>
                    {usuario.rol}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditarUsuario(usuario)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleEliminarUsuario(usuario.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      🗑️ Desactivar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-6 py-4">
              <h3 className="text-xl font-bold">
                {usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
            </div>

            <form onSubmit={handleSubmitFormulario} className="p-6 space-y-4">
              {!usuarioEditando && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {usuarioEditando ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required={!usuarioEditando}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Iniciales *
                </label>
                <input
                  type="text"
                  value={formData.iniciales}
                  onChange={(e) => setFormData({ ...formData, iniciales: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent uppercase"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Se convertirán automáticamente a mayúsculas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol *
                </label>
                <select
                  value={formData.rol}
                  onChange={(e) => setFormData({ ...formData, rol: e.target.value as RolUsuario })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  <p className="text-xs text-gray-500 mt-1">Cargando roles...</p>
                )}
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  💾 {usuarioEditando ? 'Actualizar' : 'Crear'} Usuario
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

