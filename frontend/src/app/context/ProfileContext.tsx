"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

type BluetoothDeviceOrNull = BluetoothDevice | null;

interface ProfileContextType {
  profiles: string[];
  setProfiles: React.Dispatch<React.SetStateAction<string[]>>;
  deviceName: string;
  setDeviceName: React.Dispatch<React.SetStateAction<string>>;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tempDeviceName: string;
  setTempDeviceName: React.Dispatch<React.SetStateAction<string>>;
  device: BluetoothDeviceOrNull;
  setDevice: React.Dispatch<React.SetStateAction<BluetoothDeviceOrNull>>;
  deleteProfile: (name: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profiles, setProfiles] = useState<string[]>([]);
  const [deviceName, setDeviceName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [tempDeviceName, setTempDeviceName] = useState("");
  const [device, setDevice] = useState<BluetoothDeviceOrNull>(null);
  const [mounted, setMounted] = useState(false);

  // Load profiles from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("bleProfiles");
    if (stored) {
      try {
        setProfiles(JSON.parse(stored));
      } catch {}
    }
    setMounted(true);
  }, []);

  // Save profiles to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("bleProfiles", JSON.stringify(profiles));
    }
  }, [profiles, mounted]);

  const deleteProfile = (name: string) => {
    setProfiles(prev => {
      const next = prev.filter(p => p !== name);
      if (name === deviceName) setDeviceName(next[0] ?? "");
      return next;
    });
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        setProfiles,
        deviceName,
        setDeviceName,
        open,
        setOpen,
        tempDeviceName,
        setTempDeviceName,
        device,
        setDevice,
        deleteProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

