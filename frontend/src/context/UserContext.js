import React, { createContext, useState, useEffect, useContext } from 'react';

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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Usuario cargado desde localStorage:', {
          nombre: parsedUser.nombre,
          id: parsedUser.id,
          tokenPresente: !!parsedUser.token
        });
      } catch (error) {
        console.error('Error al parsear usuario desde localStorage:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // Función para iniciar sesión
  const login = (userData) => {
    console.log('Guardando datos de usuario en contexto:', {
      nombre: userData.nombre,
      id: userData.id,
      tokenPresente: !!userData.token
    });
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('Sesión cerrada, usuario eliminado del contexto');
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
};