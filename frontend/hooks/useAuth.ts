"use client";

import { useCallback, useEffect, useState } from "react";
import { signOut } from "next-auth/react";

import { useSubscription } from "@/context/SubscriptionContext";

type Plan = "free" | "premium";

type UserResponse = {
  email: string | null;
  is_admin: boolean;
  subscription?: Plan;
  name?: string;
  avatar?: string;
  provider?: string;
};

type UseAuthReturn = {
  isAdmin: boolean;
  email: string;
  authLoading: boolean;
  name: string;
  avatar: string;
  provider: string;

  refreshUser: () => void;
  handleLogout: () => Promise<void>;
};

export function useAuth(apiUrl: string): UseAuthReturn {
  const { setPlan } = useSubscription();

  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState("");
  const [authLoading, setAuthLoading] = useState(true);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [provider, setProvider] = useState("");

  const refreshUser = useCallback(() => {
    if (!apiUrl) return;

    fetch(`${apiUrl}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: UserResponse) => {
        if (!data.email) {
          setIsAdmin(false);
          setEmail("");
          setPlan("free");

          setName("");
          setAvatar("");
          setProvider("");

          return;
        }

        setIsAdmin(data.is_admin);
        setEmail(data.email);

        setPlan(data.subscription ?? "free");

        setName(data.name || "");
        setAvatar(data.avatar || "");
        setProvider(data.provider || "email");
      })
      .catch(() => {
        setIsAdmin(false);
        setEmail("");

        setPlan("free");

        setName("");
        setAvatar("");
        setProvider("");
      })
      .finally(() => {
        setAuthLoading(false);
      });
  }, [apiUrl, setPlan]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const handleLogout = async () => {
    await fetch(`${apiUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });

    await signOut({ redirect: false });

    setIsAdmin(false);
    setEmail("");

    setName("");
    setAvatar("");
    setProvider("");

    setPlan("free");
  };

  return {
    isAdmin,
    email,
    authLoading,
    name,
    avatar,
    provider,

    refreshUser,
    handleLogout,
  };
}