
import { useState } from 'react';

interface User {
  id: number;
  username: string;
  gender: string;
  age: number;
  location: string;
  interests: string[];
  isOnline: boolean;
}

export const useUserSelection = (mockUsers: User[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<{
    gender: string[];
    ageRange: [number, number];
    countries: string[];
  }>({
    gender: ["Male", "Female"],
    ageRange: [18, 80],
    countries: [],
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const handleFiltersChange = (newFilters: {
    gender: string[];
    ageRange: [number, number];
    countries: string[];
  }) => {
    setActiveFilters(newFilters);
  };
  
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.interests.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGender = activeFilters.gender.includes(user.gender);
    
    const matchesAge = user.age >= activeFilters.ageRange[0] && user.age <= activeFilters.ageRange[1];
    
    const matchesCountry = activeFilters.countries.length === 0 || 
      activeFilters.countries.includes(user.location);
    
    return matchesSearch && matchesGender && matchesAge && matchesCountry;
  }).sort((a, b) => {
    const countryA = a.location;
    const countryB = b.location;
    const countryCompare = countryA.localeCompare(countryB);
    
    if (countryCompare === 0) {
      return a.username.localeCompare(b.username);
    }
    
    return countryCompare;
  });
  
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };
  
  const handleCloseChat = () => {
    setSelectedUser(null);
  };
  
  return {
    searchTerm,
    setSearchTerm,
    activeFilters,
    selectedUser,
    filteredUsers,
    handleFiltersChange,
    handleUserClick,
    handleCloseChat
  };
};
