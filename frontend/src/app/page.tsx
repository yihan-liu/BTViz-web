"use client"
import { useState} from 'react';
import { Button } from "@/components/ui/button";
import { Card ,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,} from '@/components/ui/card';
  import Link from "next/link";
  import { toast } from 'sonner';

import { connectToDevice, readCharacteristicValue } from './utils/BLEfunctions';
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

export default function Home() {
  // global consts do not touch

  const optionalServiceUUID: number = 0xACEF
  const optionalCharacteristicUUID: number = 0xFF01

  // STATE HOOKS
  const[deviceName, setDeviceName] = useState<string>("SpectraDerma");
  const [open, setOpen] = useState(false);
  const [tempDeviceName, setTempDeviceName] = useState(deviceName);
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [timeConnected, setTimeConnected] = useState<Date>();
  const [sensorData, setSensorData] = useState<{ timestamp: number; values: number[] }[]>([]);
  const [showChart, setShowChart] = useState<boolean>(true);
  const MAX_CHART_BUFFER_SIZE = 500;
  // TEST
  interface NotificationEntry {
    // maybe wont work might need timestamp: date()
    timestamp: number;
    data: number[];
  }
  const notificationBuffer: NotificationEntry[] = [];

  async function handleScan() {

    const characteristic = await connectToDevice(deviceName, optionalServiceUUID, optionalCharacteristicUUID);

    
    //Checks if device is still connected or not connected
    try{
    const bluetoothDevice = characteristic.service.device;
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
      
      const notifications = await readCharacteristicValue(characteristic);
      notifications.addEventListener("characteristicvaluechanged", event => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        
        // Convert the DataView to a string for logging.
        const decoder = new TextDecoder("utf-8");
        const dataString = decoder.decode(value);
        // Splits String into Array of 12 channels
        const data = dataString.split(",").map(num => parseInt(num,10));
       
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
  };

  try {
    const currentDate = new Date().toISOString();

    const docRef = doc(db, "spectradermadata", currentDate);
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
        <CardHeader >
          <CardTitle style={{ fontSize: '30px' }}>
              {deviceName} Connection
          </CardTitle>
          <CardDescription style={{ fontSize: '16px' }}>
              <p>Connect to your device via BLE</p>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col justify-between" >
          <div>
            <p>Ensure that the device is powered on and in pairing mode</p>
            <p className="flex justify-center text-lg text-gray-700">
              {isConnected ? `Connected to: ${deviceName}` : 'No device connected'}
              
            </p>
          </div>

          <div className="flex justify-center mb-40 space-x-2 items-center">
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
          {showChart && sensorData.length != 0 && <HealthChart data={sensorData} />}
          <div>
          </div>
        </CardContent>

         <CardFooter className= "flex justify-center">
          <div className = "flex items-center gap-4">
            <Dialog open = {open} onOpenChange={setOpen}>
              <DialogTrigger>Edit Profile</DialogTrigger>
              <DialogContent>
              <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make sure to save changes when you are done.
                  </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Device Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter device name"
                        value={tempDeviceName}
                        onChange={(e) => setTempDeviceName(e.target.value)}
                        className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                      <div className="mt-4">
                              <label className="block text-sm font-medium text-gray-700">
                                Select Service
                              </label>
                              <select
                           
                     // value={selectedService}
                     // onChange={handleServiceChange}
                      className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                    </select>
                  </div>
                  <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Select Characteristic
                      </label>
                      <select
                        //value={selectedCharacteristic}
                      // onChange={handleCharacteristicChange}
                        className="w-full mt-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                      </select>
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
                {isConnected ? 'Reconnect' : 'Connect to SpectraDerma'}
            </Button>
          </div>       
        </CardFooter>
      </Card>
    </div>
    );
  }
  
