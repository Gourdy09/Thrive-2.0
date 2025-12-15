import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

interface AuthContextType {
  user: (User & { email?: string }) | null;
  session: Session | null;
  loading: boolean;
  isFirstLaunch: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeFirstLaunch: () => Promise<void>;
  checkProfileComplete: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);

  useEffect(() => {
    // Check for first launch
    checkFirstLaunch();

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkFirstLaunch = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem("hasLaunched");
      if (!hasLaunched) {
        setIsFirstLaunch(true);
      }
    } catch (error) {
      console.error("Error checking first launch:", error);
    }
  };

  const completeFirstLaunch = async () => {
    try {
      await AsyncStorage.setItem("hasLaunched", "true");
      setIsFirstLaunch(false);
    } catch (error) {
      console.error("Error setting first launch:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
  };

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    setUser(data.user);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  };

  const checkProfileComplete = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_info")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) {
      console.log(error);
      return false;
    }
    if (!data) {
      return false;
    }

    return (
      data && Object.values(data).every((val) => val !== null && val !== "")
    );
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isFirstLaunch,
        signIn,
        signUp,
        signOut,
        completeFirstLaunch,
        checkProfileComplete,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
