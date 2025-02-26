"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card ,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,} from '@/components/ui/card';
  import Link from "next/link";
  import { toast } from 'sonner';

import { connectToDevice, dataViewToArray, readCharacteristicValue } from './utils/BLEfunctions';
import { set } from 'date-fns';
import { collection, addDoc } from "firebase/firestore"
import { db } from './utils/firebaseConfig';

export default function Home() {
  // global consts do not touch
  const deviceName: string = "SpectraDerma"
  const optionalServiceUUID: number = 0xACEF
  const optionalCharacteristicUUID: number = 0xFF01

  // BASE URL FOR WHICH API CALLS ARE TO BE MADE
  const baseURL: string = "localhost:3000"

  // STATE HOOKS
  const [device, setDevice] = useState("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);
  

  interface NotificationEntry {
    timestamp: Date;
    data: number[];
  }
  const notificationBuffer: NotificationEntry[] = [];

  async function handleScan() {
    const characteristic = await connectToDevice(deviceName, optionalServiceUUID, optionalCharacteristicUUID);
    console.log(characteristic);
    

    try {
      const notifications = await readCharacteristicValue(characteristic);
      notifications.addEventListener("characteristicvaluechanged", event => {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        // Convert the DataView to a string for logging.
        const decoder = new TextDecoder("utf-8");
        const dataString = decoder.decode(value);
        // Splits String into Array of 12 channels
        const data = dataString.split(",").map(num => parseInt(num,10));
       
        const timestamp = Date.now()
        notificationBuffer.push({ timestamp, data });
        console.log(`Buffered notification at ${new Date(timestamp).toISOString()}:`, data);
      });
      setIsConnected(true);
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
    const docRef = await addDoc(collection(db, "spectradermadata"), batchData);
    console.log("Batch data sent to Firebase with ID:", docRef.id);
  } catch (error) {
    console.error("Error sending data to Firebase:", error);
    throw error;
  }
}

  async function sendBatchToFirebase(buffer: NotificationEntry[]) {
    try {
      // For example, you might call your Firebase function/API:
      await firebaseSend(buffer); // Replace with your actual Firebase sending logic
      console.log("Sent batch to Firebase:", buffer);
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
  }, 5000);
  return (
    <div className='w-full h-screen flex flex-col items-center justify-center'>
            <div>
                <Link href="/data"> </Link>
      `     </div>
      <Card className="mx-auto">
        <CardHeader >
          <CardTitle style={{ fontSize: '30px' }}>
              SpectraDerma Connection
          </CardTitle>
          <CardDescription style={{ fontSize: '16px' }}>
              <p>Connect to your device via BLE</p>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex-grow flex flex-col justify-between" >
          <div>
            <p>Ensure that the device is powered on and in pairing mode</p>
            <p className="flex justify-center text-lg text-gray-700">
              {isConnected ? `Connected to: ${"SpectraDerma"}` : 'No device connected'}
            </p>
          </div>

          <div className="flex justify-center mb-40">
            <span
              className={`inline-block flex justify-center py-2 px-4 rounded-full text-white ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`}
               >
                {isConnected ? 'Connected' : 'Disconnected'}
            </span>
           </div>
          <div>
          </div>
        </CardContent>

         <CardFooter className= "flex justify-center">
          <div>
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
  
