// supabaseConfig.js
// Archivo de configuración para conectar con Supabase

// IMPORTANTE: Reemplaza estos valores con los de tu proyecto Supabase
const SUPABASE_URL = 'https://vpdsobghsarcksffhyub.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZHNvYmdoc2FyY2tzZmZoeXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxMzExNDUsImV4cCI6MjA3NTcwNzE0NX0.o1llJT7YRfpQjZZtm374CL8ATymR786yp2FXMO0OGpM';

class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL;
    this.key = SUPABASE_KEY;
  }

  // Función helper para hacer peticiones a Supabase
  async request(endpoint, options = {}) {
    const url = `${this.url}/rest/v1/${endpoint}`;
    const headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return response.json();
  }

  // Autenticar usuario
  async login(email, password) {
    try {
      // Buscar usuario en la base de datos
      const usuarios = await this.request(
        `usuarios?email=eq.${email}&password=eq.${password}&select=*`
      );

      if (usuarios.length === 0) {
        return { user: null, error: 'Credenciales incorrectas' };
      }

      return { user: usuarios[0], error: null };
    } catch (error) {
      return { user: null, error: error.message };
    }
  }

  // Obtener todas las tareas
  async getTareas(userId = null, userType = null) {
    try {
      let endpoint = 'tareas?select=*,usuarios(nombre)';
      
      // Si es estudiante, solo ver sus tareas
      if (userType === 'estudiante') {
        endpoint += `&estudiante_id=eq.${userId}`;
      }
      
      // Ordenar por fecha de creación
      endpoint += '&order=created_at.desc';

      const tareas = await this.request(endpoint);
      return tareas;
    } catch (error) {
      console.error('Error al obtener tareas:', error);
      return [];
    }
  }

  // Crear nueva tarea
  async crearTarea(tarea) {
    try {
      const result = await this.request('tareas', {
        method: 'POST',
        body: JSON.stringify(tarea)
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Actualizar tarea (calificar)
  async actualizarTarea(id, datos) {
    try {
      const result = await this.request(`tareas?id=eq.${id}`, {
        method: 'PATCH',
        body: JSON.stringify(datos)
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  }

  // Eliminar tarea
  async eliminarTarea(id) {
    try {
      await this.request(`tareas?id=eq.${id}`, {
        method: 'DELETE'
      });
      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  }

  // Obtener todos los usuarios (solo admin)
  async getUsuarios() {
    try {
      const usuarios = await this.request('usuarios?select=*&order=created_at.desc');
      return usuarios;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  }
}

// Exportar instancia única del cliente
const supabase = new SupabaseClient();
export default supabase;