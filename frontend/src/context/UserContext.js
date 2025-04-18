import React, { createContext, useState, useEffect, useContext } from 'react';
import apiClient from '../services/apiClient'; // Importar apiClient
import { getProfile } from '../services/api'; // Importar getProfile

export const UserContext = createContext();

// Custom hook para usar el contexto de usuario más fácilmente
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de un UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        // Verificar si hay un usuario almacenado
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          console.log('No hay usuario almacenado en localStorage');
          setLoading(false);
          return;
        }

        // Intentar analizar el JSON
        const parsedUser = JSON.parse(storedUser);
        
        // Verificar que el objeto del usuario tiene las propiedades necesarias
        if (!parsedUser.id || !parsedUser.token) {
          console.warn('Datos de usuario incompletos en localStorage, limpiando...');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }

        // Establecer el usuario en el contexto
        setUser(parsedUser);
        console.log('Usuario cargado desde localStorage:', {
          id: parsedUser.id,
          nombre: parsedUser.nombre,
          tokenPresente: !!parsedUser.token
        });

        // Validar el token con una llamada al backend usando apiClient
        validateToken(parsedUser.token);
      } catch (error) {
        console.error('Error al cargar usuario desde localStorage:', error);
        localStorage.removeItem('user');
        setLoading(false);
      }
    };

    // Función para validar el token con el backend
    const validateToken = async (token) => {
      try {
        // Configurar el header de autorización temporalmente para esta llamada
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Llamar a una ruta protegida, como getProfile
        await getProfile();
        console.log('✅ Token validado exitosamente con /api/profile');
        setLoading(false); // Token válido, terminar carga

      } catch (error) {
        console.warn('❌ Token inválido o expirado:', error.response?.data?.error || error.message);
        // Si el token no es válido, limpiar localStorage y estado
        localStorage.removeItem('user');
        setUser(null);
        delete apiClient.defaults.headers.common['Authorization']; // Limpiar header
        setLoading(false); // Terminar carga
      }
    };

    loadUserFromStorage();
  }, []);

  // Función para iniciar sesión o actualizar datos del usuario logueado
  const login = (userData) => {
    try {
      // --- CORRECCIÓN AQUÍ ---
      // Determinar la fuente de los datos del usuario (login inicial vs. actualización)
      const userDetails = userData.user || userData; // Si existe userData.user, úsalo; si no, usa userData directamente.
      const token = userData.token || user?.token; // Usa el token de userData si existe, si no, usa el token actual del contexto (para actualizaciones)

      // Validar que tengamos los datos esenciales
      if (!userDetails || !userDetails.id || !token) {
        console.error('Login/Update fallido: Datos esenciales (ID o Token) faltantes.', { userDetails, tokenProvided: !!userData.token });
        // Podríamos incluso intentar limpiar si el token falta en una actualización
        if (!token) logout();
        return;
      }

      // Construir el objeto a guardar/actualizar
      const dataToStore = {
        id: userDetails.id,
        nombre: userDetails.nombre,
        email: userDetails.email,
        foto_perfil: userDetails.foto_perfil,
        token: token // Asegurarse de guardar el token correcto
      };

      // Guardar en localStorage
      localStorage.setItem('user', JSON.stringify(dataToStore));

      // Actualizar estado del contexto
      setUser(dataToStore);

      // Configurar token en apiClient para futuras solicitudes (si no está ya)
      if (!apiClient.defaults.headers.common['Authorization']) {
         apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      console.log('Usuario logueado/actualizado en contexto:', dataToStore.id);

    } catch (error) {
      console.error('Error al procesar datos de login/update:', error);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('user');
    // Limpiar estado
    setUser(null);
    // Limpiar token de apiClient
    delete apiClient.defaults.headers.common['Authorization'];
    console.log('Usuario deslogueado');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};