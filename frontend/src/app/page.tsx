"use client"
import { useEffect, useState, useRef} from 'react';
import { Button } from "@/components/ui/button";
import { Card ,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,} from '@/components/ui/card';
  import Link from "next/link";
  import { toast } from 'sonner';

import { connectToDevice, getAllDevices, readCharacteristicValue, getAllServices, getAllCharacteristics } from './utils/BLEfunctions';
import {setDoc, doc } from "firebase/firestore"
import { db } from './utils/firebaseConfig';
import { HealthChart } from './utils/HealthChart';
import { Eye, EyeOff } from 'lucide-react';
import { Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogTrigger, } from "@/components/ui/dialog"
import { DEVICE_UUIDS, KnownDeviceName } from './utils/uuid-map';


export default function Home() {
  // global consts do not touch
  const optionalServiceUUID: number =   0xACEF          //  "0000ACEF-0000-1000-8000-00805F9B34FB"         
  const optionalCharacteristicUUID: number = 0xFF01     //  "0000FF01-0000-1000-8000-00805F9B34FB"    

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
  
  const [heartRateValue, setHeartRateValue] = useState<number | null>(null);
  const [tempValue, setTempValue] = useState<number | null>(null);
  const [atmPressure, setAtmPresure] = useState<number | null>(null);
  const [relativeHummitidy, setRelativeHummidity] = useState<number | null>(null);
  const [pulseOximetry, setPulseOximetry] = useState<number | null>(null);
  const MAX_CHART_BUFFER_SIZE = 500;
  
 
  

  interface NotificationEntry {
    // maybe wont work might need timestamp: date()
    timestamp: number;
    data: number[];
  }
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
        setRelativeHummidity(latestData.values[9]);
      }
    }
  }, 2000); 
  return () => clearInterval(intervalId);
}, []);


  
 

  

  async function handleScan() {
    // if (!selectedService || !selectedCharacteristic) {
    //   toast.error("Please select a service and characteristic first.");
    //   return;  // Exit early if no service or characteristic is selected
    // }
    
    const dev = (deviceName in DEVICE_UUIDS
      ? (deviceName as KnownDeviceName)
      : "SpectraDerma") as KnownDeviceName;

    const { service,characteristic } = DEVICE_UUIDS[dev];
    console.log(service,characteristic)
    
    const characteristicHandle = await connectToDevice(deviceName, service, characteristic);
    
    
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
      setErrorMessage(error.message);
      toast.error(error.message);
    }
  }

  async function firebaseSend(buffer: NotificationEntry[]): Promise<void> {
  // Package the batch data along with a batch timestamp.
  const batchData = {
    batchTimestamp: Date.now(),
    notifications: buffer,
    deviceName: deviceName
  };

  try {
    const currentDate = new Date().toISOString();

    const docRef = doc(db, "spectradermadata", currentDate);
    console.log(batchData);
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
    <div className='w-full h-screen flex flex-col items-center justify-center'>
            <div>
                <Link href="/data"> </Link>
      `     </div>
      <Card className="mx-auto w-11/12 h-full">
        <CardHeader className = "relative" >
        <div className="absolute top-6 right-20 flex space-x-2 items-center">
            <span
              className={`inline-block flex justify-center py-2 px-4 rounded-full text-white ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
               >
                {isConnected ? 'Connected' : 'Disconnected'}
            </span> 
        <Button
              onClick={() => setShowChart(prev => !prev)}
              className="bg-gray-700 text-white py-2 px-4 border-2 border-gray-700 hover:bg-gray-600 transition-all duration-300"
            >
              {showChart ? <Eye/> : <EyeOff/>}
          </Button>
        </div>

          <CardTitle style={{ fontSize: '30px' }}>
          {isConnected ? `Connected to: ${deviceName}` : 'BLE Connection Interface'} 
          </CardTitle>
          <CardDescription style={{ fontSize: '16px' }}>
              <p>Ensure that the device is powered on and in pairing mode</p>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col justify-between" >
  













          <div className="flex justify-center text-xl text-gray-700 mt-4 space-x-4">
              {heartRateValue !== null && ( <p>Heart Rate: {heartRateValue}</p>)}
              {pulseOximetry !== null && <p>o2 Saturation: {pulseOximetry}</p>}
              {tempValue !== null && <p>Temperature: {tempValue}</p>}
              {atmPressure !== null && <p>Atmospheric Pressure: {atmPressure}</p>}
              {relativeHummitidy !== null && <p>Relative Hummidity: {relativeHummitidy}</p>}
          </div>
          {showChart && sensorData.length != 0 && <HealthChart data={sensorData} />}
        
        </CardContent>

         <CardFooter className= "flex justify-center">
          <div className = "flex items-center gap-4">
            <Dialog open = {open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                Edit Profile
                </Button>
              </DialogTrigger>

              <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make sure to save changes when you are done.
                  </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Device:
                      </label>
                      <input
                            type="text"
                            value={tempDeviceName}
                            onChange={(e) => setTempDeviceName(e.target.value)}
                            placeholder="Enter Device Name"
                            className="text-sm text-gray-700 w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
              
                      </div>
                  
                     
                  <Button className="bg-black text-white border-0" onClick={() => {
                      setDeviceName(tempDeviceName);
                      setOpen(false);    
                      console.log("Profile changes saved");
                       }}>
                      Save Changes
                    </Button>

              </DialogContent>
            </Dialog>

            <Button onClick={handleScan} disabled={isConnected}
              className="bg-black text-white py-2 px-6  border-2 border-black hover:text-black transition-all duration-300">
                {isConnected ? 'Reconnect' : 'Connect'}
            </Button>
          </div>       
        </CardFooter>
      </Card>
      
    </div>
    );
  }
  
