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

  // Función para iniciar sesión
  const login = (userData) => {
    try {
      // Asegurarse que userData y userData.user existen
      if (!userData || !userData.user || !userData.token) {
        console.error('Login fallido: Datos de usuario incompletos recibidos.', userData);
        return;
      }

      // Guardar en localStorage (solo user y token)
      const dataToStore = {
        id: userData.user.id,
        nombre: userData.user.nombre,
        email: userData.user.email,
        foto_perfil: userData.user.foto_perfil,
        token: userData.token
      };
      localStorage.setItem('user', JSON.stringify(dataToStore));

      // Actualizar estado
      setUser(dataToStore);

      // Configurar token en apiClient para futuras solicitudes
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
      console.log('Usuario logueado:', dataToStore.id);
    } catch (error) {
      console.error('Error al procesar datos de login:', error);
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