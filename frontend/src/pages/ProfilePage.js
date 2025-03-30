import React, { useContext, useState, useEffect } from 'react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

const ProfilePage = () => {
  const { user, logout } = useContext(UserContext);
  const [profileData, setProfileData] = useState({ nombre: '', email: '', foto_perfil: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      axios.get('/api/profile', {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      })
      .then(response => {
        setProfileData(response.data);
      })
      .catch(error => {
        console.error('Error fetching profile data:', error);
      });
    }
  }, [user]); 
  
  return (
    <div>
      <h1>Perfil de usuario</h1>
      {/* aquí puedes mostrar los datos */}
      <p>Nombre: {profileData.nombre}</p>
      <p>Email: {profileData.email}</p>
      <img src={profileData.foto_perfil} alt="Foto de perfil" />
    </div>
  );
};

export default ProfilePage;