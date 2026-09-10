"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function useLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);

  const router = useRouter();
  const { signIn } = useAuth();

  const validateEmail = (val: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(val);
  };

  const validateForm = () => {
    if (!validateEmail(email)) {
      setError("Format email tidak valid");
      return false;
    }

    if (password.length < 6) {
      setError("Password minimal 6 karakter");
      return false;
    }

    return true;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (value) {
      setEmailValid(validateEmail(value));
    } else {
      setEmailValid(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/admin");
      }, 700);
    } catch {
      setError("Email atau Password salah");
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const getEmailBorderClass = () => {
    if (emailValid === true) {
      return "border-green-500 focus:border-green-500 focus:ring-green-500/20";
    }
    if (emailValid === false) {
      return "border-red-500 focus:border-red-500 focus:ring-red-500/20";
    }
    return "border-stone-200 hover:border-stone-400 focus:border-stone-800 focus:ring-stone-800/20";
  };

  const getEmailIconColor = () => {
    if (focusedField === "email") return "text-stone-900";
    if (emailValid === true) return "text-green-500";
    if (emailValid === false) return "text-red-500";
    return "text-stone-400 group-hover:text-stone-700";
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    toggleShowPassword,
    error,
    setError,
    loading,
    isSuccess,
    focusedField,
    setFocusedField,
    emailValid,
    handleEmailChange,
    handleSubmit,
    getEmailBorderClass,
    getEmailIconColor,
  };
}
