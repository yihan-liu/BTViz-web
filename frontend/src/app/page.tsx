"use client"
import React from "react";
import TagBlock from "@/components/ui/TagBlock";
import { uploadTagsForMeasurement } from "@/app/utils/api";
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from "@/components/ui/app-sidebar"
import { useEffect, useState, useRef} from 'react';
import { Button } from "@/components/ui/button";
import { Card , CardContent, CardHeader,
  CardTitle,} from '@/components/ui/card';
  import Link from "next/link";
  import { toast } from 'sonner';

import { connectToDevice, readCharacteristicValue } from './utils/BLEfunctions';
import {setDoc, doc, updateDoc } from "firebase/firestore"
import { db } from './utils/firebaseConfig';
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


export default function Home() {
  // global consts do not touch
  const optionalServiceUUID: number =   0xACEF          //  "0000ACEF-0000-1000-8000-00805F9B34FB"         
  const optionalCharacteristicUUID: number = 0xFF01     //  "0000FF01-0000-1000-8000-00805F9B34FB"    
   const [profiles, setProfiles] = useState<string[]>([]);    // all saved

  // STATE HOOKS
  const[deviceName, setDeviceName] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [tempDeviceName, setTempDeviceName] = useState("");
  const [device, setDevice] = useState<BluetoothDevice | null>(null);

  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [timeConnected, setTimeConnected] = useState<Date>();
  const [sensorData, setSensorData] = useState<{ timestamp: number; values: number[] }[]>([]);
  const [showChart, setShowChart] = useState<boolean>(true);

  const [characteristics, setCharacteristics] = useState<BluetoothRemoteGATTCharacteristic[]>([]);
  const [services, setServices] = useState<BluetoothRemoteGATTService[]>([]); 
  const [selectedCharacteristic, setSelectedCharcteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null); 
  const [selectedService, setSelectedService] = useState<BluetoothRemoteGATTService | null>(null); 
  const [selectedServiceUUID, setSelectedServiceUUID] = useState<string>("");
  const [selectedCharacteristicUUID, setSelectedCharcteristicUUID] = useState<string>("");
  const [mounted, setMounted] = useState(false);
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
  Other: [],
});
  

 interface NotificationEntry {
    // maybe wont work might need timestamp: date()
    timestamp: number;
    data: number[];
  }


useEffect(() => {
  localStorage.setItem("bleProfiles", JSON.stringify(profiles));
}, [profiles]);
  const notificationBuffer: NotificationEntry[] = [];
const sensorDataRef = useRef(sensorData);

// Update the ref whenever sensorData changes
useEffect(() => {
  sensorDataRef.current = sensorData;
}, [sensorData]);

useEffect(() => {
  const stored = localStorage.getItem("bleProfiles");
  if (stored) {
    try {
      setProfiles(JSON.parse(stored));  // ["SpectraDerma", "MySensor", …]
    } catch {
      /* ignore JSON errors */
    }
  }
  setMounted(true); 
}, []);

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


function deleteProfile(name: string) {
  setProfiles((prev) => {
    const next = prev.filter((p) => p !== name);
    // if we just deleted the active profile, clear or pick the first remaining
    if (name === deviceName) setDeviceName(next[0] ?? "");
    return next;
  });
}

 


  async function handleTagsUpload(selectedTags: Record<string, string[]>) {
  console.log("▶ Page: handleTagsUpload fired with", selectedTags);

  if (!deviceName) {
    console.log("▶ Page: no deviceName, calling toast.error");
    toast.error("Please connect or select a device first.");
    return;
  }

  const now = new Date().toISOString();
  const tagDocId = `${deviceName}__${now}`;
  console.log("▶ Page: about to call setDoc");
  const timeoutId = setTimeout(() => {
    console.error("‼ setDoc timed out (>5s), possibly due to network or rules preventing writing");
    alert("⚠️ setDoc timed out, please check your network or security rules");
  }, 5000);

  try {
    await setDoc(
      doc(db, "measurementTags", tagDocId),
      { deviceName, timestamp: now, tags: selectedTags },
      { merge: true }
    );
    clearTimeout(timeoutId);
    console.log("▶ Page: setDoc returned successfully");
    alert("✅ setDoc succeeded");
    toast.success("Labels have been uploaded to Firestore");
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error("▶ Page: Firestore write failed with error:", err);
    alert("❌ setDoc error: " + err.message);
    toast.error("Labels upload failed: Please try again later");
  }
}



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

        notificationBuffer.push({ timestamp, data });
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
    tags: currentTags,
  };

  try {
    const currentDate = new Date().toISOString();

    const docRef = doc(db, "spectradermadata", currentDate);
    // console.log(batchData);
    await setDoc(docRef, batchData);
    
    // console.log("Batch data sent to Firebase with ID:", docRef.id);
  } catch (error) {
    console.error("Error sending data to Firebase:", error);
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
      <AppSidebar
              isConnected={isConnected}
              onScan={handleScan}
              open={open}
              setOpen={setOpen}
              tempDeviceName={tempDeviceName}
              setTempDeviceName={setTempDeviceName}
        
            onSaveProfile={() => {
            // add to list if it’s new, then make it the active device
            if (tempDeviceName && !profiles.includes(tempDeviceName)) {
              setProfiles([...profiles, tempDeviceName]);
            }
            setDeviceName(tempDeviceName);   // active/selected profile
            setOpen(false);                  // close the dialog
            }}
        
            profiles={profiles}
            deviceName={deviceName}
            setDeviceName={setDeviceName}
            onDeleteProfile={deleteProfile}
        />
            <div>
                <Link href="/data"> </Link>
      `     </div>
        
        {/* ——— RIGHT (main) ——— */}
        <main className="flex-1 flex flex-col overflow-y-auto p-6 gap-6">
        <div className="flex items-center justify-between">
            {mounted && (
  <h2 className="text-2xl font-bold">
    {isConnected
      ? (
        <>Connected to <span className="text-primary">{deviceName || "Unknown Device"}</span></>
      )
      : (
        <>Not connected to <span className="text-muted-foreground">{deviceName || "any device"}</span></>
      )}
  </h2>
)}

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

          {/* Bottom Row: Graph Card */}


         {showChart && sensorData.length > 0 && (
            (deviceName === "MIRAS") ? (
              <>
            <Card className="flex-1 flex flex-col  overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-lg">
              <CardHeader className="p-6">
                  <CardTitle>Channels 0-2</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 h-full p-4 pt-0">
                <HealthChart data={sensorData} 
                    channels={[0, 1, 2]}
                />
              </CardContent>
            </Card>

            <Card className="flex-1 flex flex-col  overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-lg">
              <CardHeader className="p-6">
                  <CardTitle>Channels 3-5</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 h-full p-4 pt-0">
                <HealthChart data={sensorData} 
                    channels={[3,4,5]}
                />
              </CardContent>
            </Card>
            </>
            ) : (
            <Card className="flex-1 flex flex-col  overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-lg">
              <CardHeader className="p-6">
                  <CardTitle>Channels 0-5</CardTitle>
              </CardHeader>

              <CardContent className="flex-1 min-h-0 h-full p-4 pt-0">
                <HealthChart data={sensorData} 
                      channels={[0, 1, 2, 3, 4, 5]}
      
                />
              </CardContent>
            </Card>
            )
          )}
          <div className="mt-6 grid grid-cols-3 gap-6">
            <div className="col-span-2"></div>
            <div className="col-span-1">
              <Card className="flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-background/70 backdrop-blur shadow-lg">
                <CardHeader className="p-4">
                  <CardTitle>Add Tags</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <TagBlock onUpload={(tags) => {
                    console.log("update currentTags:", tags);
                    setCurrentTags(tags);
                    toast.success("The tags have been applied, and the next data upload will include these tags.");}}/>
                </CardContent>
              </Card>
            </div>
          </div>

        </main>
        </div>
    </SidebarProvider>
    );
  }
  
