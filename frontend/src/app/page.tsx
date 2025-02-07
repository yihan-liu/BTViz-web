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
import { connectToDevice, dataViewToArray, readCharacteristicValue } from './utils/BLEfunctions';
import { set } from 'date-fns';

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
  
  async function handleScan() {
    const characteristic = await connectToDevice(deviceName, optionalServiceUUID, optionalCharacteristicUUID);
    console.log(characteristic);
    if(characteristic){
      setIsConnected(true);
    }

    try {
      const value = await readCharacteristicValue(characteristic);
      handleNewSensorData(value);
    } catch (error) {
      setErrorMessage(error.message);
    }
  }

  // SENSOR DATA BUFFER
  let sensorDataBuffer: number[] = []

  // called everytime we get new sensor data 
  function handleNewSensorData(data: number) {
    sensorDataBuffer.push(data);
    if (sensorDataBuffer.length >= 100) {
      sendBatchToServer();
    }
  }

  function sendBatchToServer() {
    // send the data to the server - link is broken.
    fetch('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ data: sensorDataBuffer }),
      headers: { 'Content-Type': 'application/json' }
    });
    sensorDataBuffer = [];
  }



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
              {errorMessage && (
                 <p style={{ color: 'red' }}>Error: {errorMessage}</p>
              )}
          </div>
        </CardContent>

         <CardFooter className= "flex justify-center">
          <div>
            <Button onClick={handleScan}
              className="bg-black text-white py-2 px-6  border-2 border-black hover:text-black transition-all duration-300">
                {isConnected ? 'Reconnect' : 'Connect to SpectraDerma'}
            </Button>
          </div>       
        </CardFooter>
      </Card>
    </div>
    );
  }
  
