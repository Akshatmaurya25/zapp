"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@/hooks/useWallet";
import { User, CreateUserData, UpdateUserData } from "@/types";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserContextType {
  // Current user state
  user: User | null;
  isLoading: boolean;
  isError: boolean;

  // User operations
  createUser: (data: CreateUserData) => Promise<User>;
  updateUser: (data: UpdateUserData) => Promise<User>;
  refreshUser: () => void;

  // User queries
  getUserByAddress: (address: string) => Promise<User | null>;
  getUserByUsername: (username: string) => Promise<User | null>;
  checkUsernameAvailable: (username: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useWallet();
  const queryClient = useQueryClient();

  // Query current user data
  const {
    data: user,
    isLoading,
    isError,
    refetch: refreshUser,
  } = useQuery({
    queryKey: ["user", address],
    queryFn: async () => {
      if (!address) return null;
      return await getUserByAddress(address);
    },
    enabled: !!address && isConnected,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get user by wallet address
  const getUserByAddress = async (
    walletAddress: string
  ): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress.toLowerCase())
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No user found
          return null;
        }
        throw error;
      }

      return data as User;
    } catch (error) {
      console.error("Error fetching user by address:", error);
      return null;
    }
  };

  // Get user by username
  const getUserByUsername = async (username: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username.toLowerCase())
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          return null;
        }
        throw error;
      }

      return data as User;
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return null;
    }
  };

  // Check if username is available
  const checkUsernameAvailable = async (username: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.toLowerCase())
        .single();

      if (error && error.code === "PGRST116") {
        // No user found, username is available
        return true;
      }

      return !data; // If data exists, username is taken
    } catch (error) {
      console.error("Error checking username availability:", error);
      return false;
    }
  };

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: CreateUserData): Promise<User> => {
      // Use API route for user creation to bypass RLS
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet_address: userData.wallet_address.toLowerCase(),
          username: userData.username?.toLowerCase(),
          display_name: userData.display_name,
          bio: userData.bio,
          avatar_ipfs: userData.avatar_ipfs,
          website_url: userData.website_url,
          twitter_handle: userData.twitter_handle,
          discord_handle: userData.discord_handle,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create user");
      }

      const data = await response.json();
      return data.user as User;
    },
    onSuccess: (newUser) => {
      // Update the cache with the new user
      queryClient.setQueryData(["user", address], newUser);

      // Trigger achievement for first login
      triggerFirstLoginAchievement(newUser.id);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async (userData: UpdateUserData): Promise<User> => {
      if (!user) {
        throw new Error("No user to update");
      }

      console.log('Updating user with data:', userData);
      console.log('Current user ID:', user.id);

      // Use API route to update user profile
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          ...userData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user profile')
      }

      const data = await response.json()
      console.log('Successfully updated user via API:', data.user);
      return data.user as User;
    },
    onSuccess: (updatedUser) => {
      // Update the cache with the updated user
      queryClient.setQueryData(["user", address], updatedUser);
      console.log('User cache updated successfully');
    },
    onError: (error) => {
      console.error('Update user mutation error:', error);
    },
  });

  // Trigger first login achievement
  const triggerFirstLoginAchievement = async (userId: string) => {
    try {
      // Check if user already has first login achievement
      const { data: existingAchievement } = await supabase
        .from("achievements")
        .select("id")
        .eq("user_id", userId)
        .eq("achievement_type", "first_login")
        .single();

      if (!existingAchievement) {
        // Create first login achievement
        await supabase.from("achievements").insert([
          {
            user_id: userId,
            achievement_type: "first_login",
            metadata: {
              name: "Welcome to Zapp!",
              description:
                "Successfully connected your wallet and joined the community",
              image_ipfs: "", // Add default achievement image
              rarity: "common",
              category: "milestone",
            },
          },
        ]);
      }
    } catch (error) {
      console.error("Failed to create first login achievement:", error);
    }
  };

  // Update last active timestamp
  useEffect(() => {
    if (user && isConnected) {
      const updateLastActive = async () => {
        await supabase
          .from("users")
          .update({ last_active_at: new Date().toISOString() })
          .eq("id", user.id);
      };

      updateLastActive();

      // Update every 5 minutes while active
      const interval = setInterval(updateLastActive, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user, isConnected]);

  const contextValue: UserContextType = {
    user: user || null,
    isLoading,
    isError,
    createUser: createUserMutation.mutateAsync,
    updateUser: updateUserMutation.mutateAsync,
    refreshUser: () => refreshUser(),
    getUserByAddress,
    getUserByUsername,
    checkUsernameAvailable,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

// Hook to check if user needs to complete profile setup
export function useProfileSetup() {
  const { user, isLoading } = useUser();

  return {
    needsSetup: !isLoading && (!user || !user.username || !user.display_name),
    isComplete: !isLoading && user && user.username && user.display_name,
    user,
    isLoading,
  };
}
