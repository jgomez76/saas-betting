"use client";

import { useCallback, useEffect, useState } from "react";

import { useSubscription } from "@/context/SubscriptionContext";
import type { User } from "@/types/user";

type Plan = "free" | "premium";

type UserResponse = {
  email: string | null;
  is_admin: boolean;
  subscription?: Plan;

  subscription_status?: string;
  subscription_end?: string;

  name?: string;
  avatar?: string;
  provider?: string;
};

type UseAuthReturn = {
  isAdmin: boolean;
  authLoading: boolean;

  user: User;

  refreshUser: () => void;
  handleLogout: () => Promise<void>;
};

export function useAuth(apiUrl: string): UseAuthReturn {
  const { setPlan } = useSubscription();

  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [user, setUser] = useState<User>({
    email: "",
    name: "",
    avatar: "",
    provider: "email",
    subscription: "free",
    subscription_status: undefined,
    subscription_end: undefined,
  });

  const refreshUser = useCallback(() => {
    if (!apiUrl) return;

    fetch(`${apiUrl}/me`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data: UserResponse) => {

        if (!data.email) {

          setIsAdmin(false);

          setUser({
            email: "",
            name: "",
            avatar: "",
            provider: "email",
            subscription: "free",
            subscription_status: undefined,
            subscription_end: undefined,
          });

          setPlan("free");

          return;
        }

        setIsAdmin(data.is_admin);

        setUser({
          email: data.email,
          name: data.name || "",
          avatar: data.avatar || "",
          provider: data.provider || "email",
          subscription: data.subscription ?? "free",
          subscription_status: data.subscription_status,
          subscription_end: data.subscription_end,
        });

        setPlan(data.subscription ?? "free");

      })
      .catch((err) => {

        console.warn(
          "⚠️ Auth server unavailable",
          err
        );

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

    setIsAdmin(false);

    setUser({
      email: "",
      name: "",
      avatar: "",
      provider: "email",
      subscription: "free",
      subscription_status: undefined,
      subscription_end: undefined,
    });

    setPlan("free");

  };

  return {
    isAdmin,
    authLoading,
    user,

    refreshUser,
    handleLogout,
  };
}