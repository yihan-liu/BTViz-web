"use client"
import React from "react";
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from "@/components/ui/app-sidebar"
import { useEffect, useState, useRef} from 'react';
import { Button } from "@/components/ui/button";
import { Card , CardContent, CardHeader,
  CardTitle,} from '@/components/ui/card';
  import { toast } from 'sonner';

import { connectToDevice, readCharacteristicValue } from './utils/BLEfunctions';
import { HealthChart } from './utils/HealthChart';
import { Eye, EyeOff } from 'lucide-react';
import { DEVICE_UUIDS, KnownDeviceName } from './utils/uuid-map';
import {
  HeartPulse,
  Activity,
  Thermometer,
  GaugeCircle,
  Droplets,
} from "lucide-react";
import DashboardCard from "@/components/ui/dashboardCard";
import TagInputs from "@/components/ui/taginputs";
import { useProfile } from "@/app/context/ProfileContext";
import ResponsiveSidebar from "@/components/ui/responsive-sidebar";
import type { AppSidebarProps } from "@/components/ui/app-sidebar";

export default function Home() {
  // global consts do not touch  
  //Devices Profile
  const {
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
} = useProfile();

  const [selectedChannels, setSelectedChannels] = useState<number[]>([0, 1, 2, 3, 4, 5]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [timeConnected, setTimeConnected] = useState<Date>();
  const [sensorData, setSensorData] = useState<{ timestamp: number; values: number[] }[]>([]);
  const [showChart, setShowChart] = useState<boolean>(true);

  
  const [heartRateValue, setHeartRateValue] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<number | null>(null);
  const [atmPressure, setAtmPresure] = useState<number | null>(null);
  const [relativeHumidity, setRelativeHummidity] = useState<number | null>(null);
  const [pulseOximetry, setPulseOximetry] = useState<number | null>(null);
  const MAX_CHART_BUFFER_SIZE = 500;
  const [currentTags, setCurrentTags] = useState<Record<string, string[]>>({
  Environment: [],
  Mood: [],
  Activity: [],
  Intensity: [],
  Time: [],
  Other: []
});
const categories: string[] = Object.keys(currentTags);

const allOptions: Record<string, string[]> = {
    Environment: ["Indoor", "Outdoor", "Lab", "Field"],
    Mood: ["Happy", "Stressed", "Calm", "Anxious"],
    Activity: ["Resting", "Walking", "Running", "Cycling"],
    Intensity: ["Low", "Moderate", "High", "Max"],
    Time: ["Morning","Noon","Afternoon","Evening","Night"],
    Other: ["Test", "Control", "Baseline", "Custom"]
  };


 interface NotificationEntry {
    // maybe wont work might need timestamp: date()
    timestamp: number;
    data: number[];
    tags: Record<string, string[]>;
  }
const sidebarProps: AppSidebarProps = {
  isConnected,
  onScan: handleScan,
  open, setOpen,
  tempDeviceName, setTempDeviceName,
  onSaveProfile: () => {
            // add to list if it’s new, then make it the active device
            if (tempDeviceName && !profiles.includes(tempDeviceName)) {
              setProfiles([...profiles, tempDeviceName]);
            }
            setDeviceName(tempDeviceName);   // active/selected profile
            setOpen(false);                  // close the dialog
  },
  profiles,
  deviceName,
  setDeviceName,
  onDeleteProfile: deleteProfile,
};

const notificationBuffer: NotificationEntry[] = [];
const sensorDataRef = useRef(sensorData);

// Update the ref whenever sensorData changes
useEffect(() => {
  sensorDataRef.current = sensorData;
}, [sensorData]);



// Set up the 5-second interval only once on component mount
useEffect(() => {
  const intervalId = setInterval(() => {
    if (sensorDataRef.current.length > 0) {
      // Get the latest sensor data
      const latestData = sensorDataRef.current[sensorDataRef.current.length - 1];
      // Check that the values array has at least 6 channels
      if (latestData.values && latestData.values.length >= 12) {
        setHeartRateValue(latestData.values[6]);
        setTempValue(latestData.values[8]);
        setAtmPresure(latestData.values[10]);
        setPulseOximetry(latestData.values[7]);
        setRelativeHummidity(latestData.values[9] *100);
      }
    }
  }, 2000); 
  return () => clearInterval(intervalId);
}, []);

const detectedChannelCount = React.useMemo(() => {
  const first = sensorData.find((d) => Array.isArray(d.values));
  return first?.values?.length ?? 0;
}, [sensorData]);

const currentTagsRef = useRef(currentTags);
useEffect(() => {
  currentTagsRef.current = currentTags;
  console.log("updated tag ref:", currentTagsRef.current);
}, [currentTags]);


  async function handleScan() {
    // if (!selectedService || !selectedCharacteristic) {
    //   toast.error("Please select a service and characteristic first.");
    //   return;  // Exit early if no service or characteristic is selected
    // }
    
    const dev = (deviceName in DEVICE_UUIDS ? (deviceName as KnownDeviceName): "SpectraDerma") as KnownDeviceName;

    const { service,characteristic } = DEVICE_UUIDS[dev];
    // console.log(service,characteristic)
    
    const characteristicHandle = await connectToDevice(deviceName, service, characteristic);
    // console.log(characteristicHandle);
    //Checks if device is still connected or not connected
    try{
    const bluetoothDevice = characteristicHandle.service.device;
    setDevice(bluetoothDevice);

    if (bluetoothDevice.gatt && bluetoothDevice.gatt.connected) {
      setIsConnected(true);
      
    } else{
      setIsConnected(false);
    }
    bluetoothDevice.addEventListener("gattserverdisconnected", ()=>{
      setIsConnected(false);
      setDevice(null);
    } )
  } catch (error) {
    console.log("Is not Connected")
    setErrorMessage(error.message);
  }

    try {
      const connectionTime = new Date();
      
      const notifications = await readCharacteristicValue(characteristicHandle);
      notifications.addEventListener("characteristicvaluechanged", event => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        
        // Convert the DataView to a string for logging.
        const decoder = new TextDecoder("utf-8");
        const dataString = decoder.decode(value);
        // Splits String into Array of 12 channels
        const data = dataString.split(",").map(num => parseFloat(num));
       
        const timestamp = Date.now() - connectionTime.getTime();

        setSensorData(prevData => {
          const newData = [...prevData, { timestamp, values: data }];
          // Keep only the most recent MAX_POINTS entries
          if (newData.length > MAX_CHART_BUFFER_SIZE) {
            return newData.slice(newData.length - MAX_CHART_BUFFER_SIZE);
          }
          return newData;
        });

        notificationBuffer.push({ timestamp, data, tags: currentTagsRef.current});
        // console.log(`Buffered notification at ${new Date(timestamp).toISOString()}:`, data);
      });
      
      
    } catch (error) {
      console.log("Error");
      setErrorMessage(error.message);
      toast.error(error.message);
    }
  }

  async function firebaseSend(buffer: NotificationEntry[]): Promise<void> {
  // Package the batch data along with a batch timestamp.
  const batchData = {
    batchTimestamp: Date.now(),
    notifications: buffer,
    deviceName: deviceName,
  };

  try {
    console.log("Sending batch:", batchData)
    const resp = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(batchData),
    });
  
  } catch (error) {
    console.error("Error sending data to API Route:", error);
    throw error;
  }
}

  async function sendBatchToFirebase(buffer: NotificationEntry[]) {
    try {
      // For example, you might call your Firebase function/API:
      await firebaseSend(buffer); // Replace with your actual Firebase sending logic
      // console.log("Sent batch to Firebase:", buffer);
    } catch (err) {
      console.error("Error sending batch to Firebase:", err);
    }
  }

  setInterval(() => {
    if (notificationBuffer.length > 0) {
      // Send the accumulated notifications
      sendBatchToFirebase([...notificationBuffer]); // send a copy of the buffer
      // Clear the buffer
      notificationBuffer.length = 0;
    }
  }, 1000);



  return (
<SidebarProvider>
    <div className='flex  w-screen '>
      <ResponsiveSidebar sidebarProps={sidebarProps}>               
        {/* ——— RIGHT (main) ——— */}
        <main className="flex-1 flex flex-col overflow-y-auto p-6 gap-6">
        <div className="flex items-center justify-between">
            
  <h2 className="text-2xl font-bold">
    {isConnected
      ? (
        <>Connected to <span className="text-primary">{deviceName || "Unknown Device"}</span></>
      )
      : (
        <>Not connected to <span className="text-muted-foreground">{deviceName || "any device"}</span></>
      )}
  </h2>

          <Button
              onClick={() => setShowChart(prev => !prev)}
              className="bg-gray-700 text-white py-2 px-4 border-2 border-gray-700 hover:bg-gray-600 transition-all duration-300"
            >
              {showChart ? <Eye/> : <EyeOff/>}
          </Button>
        </div>
      
       {/* ▸ Row 2 – five metric cards */}
      <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <DashboardCard
              title="Heart Rate"
              value={
                heartRateValue !== null ? `${heartRateValue} bpm` : "N/A"
              }
              icon={HeartPulse}
              variant="heart"
            />
            <DashboardCard
              title="Pulse Oximetry"
              value={pulseOximetry !== null ? `${pulseOximetry}%` : "N/A"}
              icon={Activity}
              variant="oxygen"
            />
            <DashboardCard
              title="Temperature"
              value={tempValue !== null ? `${tempValue} °C` : "N/A"}
              icon={Thermometer}
              variant="temp"
            />
            <DashboardCard
              title="Relative Humidity"
              value={
                relativeHumidity !== null ? `${relativeHumidity}%` : "N/A"
              }
              icon={Droplets}
              variant="humid"
            />
            <DashboardCard
              title="Atmospheric Pressure"
              value={atmPressure !== null ? `${atmPressure} atm` : "N/A"}
              icon={GaugeCircle}
              variant="pressure"
            />
          </div>

         {showChart && sensorData.length > 0 && (
  <div className="flex flex-wrap items-center gap-4 px-1 pb-2">
    {/* Label */}
    <span className="text-sm font-semibold text-muted-foreground">Select Channels:</span>

    {/* Master checkbox: All */}
    <label className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted transition">
      <input
        type="checkbox"
        checked={selectedChannels.length === detectedChannelCount}
        onChange={(e) => {
          const all = Array.from({ length: detectedChannelCount }, (_, i) => i);
          setSelectedChannels(e.target.checked ? all : []);
        }}
        className="accent-primary h-4 w-4"
      />
      All
    </label>

    {/* Individual checkboxes */}
    {Array.from({ length: detectedChannelCount }, (_, ch) => (
      <label
        key={ch}
        className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted transition"
      >
        <input
          type="checkbox"
          checked={selectedChannels.includes(ch)}
          onChange={() =>
            setSelectedChannels((prev) =>
              prev.includes(ch)
                ? prev.filter((c) => c !== ch)
                : [...prev, ch].sort((a, b) => a - b)
            )
          }
          className="accent-primary h-4 w-4"
        />
        Ch {ch}
      </label>
    ))}
  </div>
)}




         {showChart && sensorData.length > 0 && (
            (deviceName === "MIRAS") ? (
              <>
            {selectedChannels.some((ch) => ch <= 5) && (
            <Card className="flex-1 flex flex-col  overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-lg">
              <CardHeader className="p-6">
                  <CardTitle>Channels 0-2</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 h-full p-4 pt-0">
                <HealthChart data={sensorData} 
                  channels={selectedChannels.filter((ch) => ch <= 2)}
                />
              </CardContent>
            </Card>
            )}

            {selectedChannels.some((ch) => ch <= 5) && (
            <Card className="flex-1 flex flex-col  overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-lg">
              <CardHeader className="p-6">
                  <CardTitle>Channels 3-5</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 h-full p-4 pt-0">
                <HealthChart data={sensorData} 
                   channels={selectedChannels.filter((ch) => ch >= 3)}
                />
              </CardContent>
            </Card>
            )}
            </>
            ) : (
            selectedChannels.length > 0 && (
            <Card className="flex-1 flex flex-col  overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-lg">
              <CardHeader className="p-6">
                  <CardTitle>Channels 0-5</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 h-full p-4 pt-0">
                <HealthChart data={sensorData} 
                       channels={selectedChannels}
                />
              </CardContent>
            </Card>
            )
          )
          )}
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="col-span-2"></div>
            <div className="col-span-1">
              <Card className="flex flex-col h-full overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-lg ">
                <CardHeader className="p-4">
                  <CardTitle>Add Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <TagInputs
                    categories={categories}
                    allOptions={allOptions}
                    onApply={(tags) => {
                      // 1. make the new list globally visible *right now*
                      currentTagsRef.current = tags;
                      setCurrentTags(tags);

                      // 2. retrofit every unsent notification already in the buffer
                      notificationBuffer.forEach((entry) => (entry.tags = tags));

                      toast.success("Tags applied — all future and queued data now include them.");
                    }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

        </main>
        </ResponsiveSidebar>
        </div>
    </SidebarProvider>
    );
  }
  
