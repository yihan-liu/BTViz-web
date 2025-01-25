"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card ,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,} from '@/components/ui/card';


export default function Home() {
  const [devices, setDevices] = useState("");
  const [errorMessage, setErrorMessage] = useState('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  async function handleScan() {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      setErrorMessage('Web Bluetooth is not supported in this browser/environment.');
      return;
    }
    
    try {
      // Request a device that advertises the battery service
      const device = await navigator.bluetooth.requestDevice({
       filters: [{name: "SpectraDerma"}],
       optionalServices : [0xACEF]
      });
      console.log("Device:")
      console.log(device);
      if(device != null){

      }
      const server = await device.gatt?.connect()
      console.log("Server:")
      console.log(server);

      // Connect to GATT server

      // Get the battery service
      const service = await server.getPrimaryServices();
      console.log("Service:");
      console.log(service);

      // Get the battery level characteristic
      const characteristic = await service[0].getCharacteristic(0xFF01);
      console.log("characteristic:");
      console.log(characteristic);
      // Read the current battery level
      const value = await characteristic.readValue();

      console.log("value")
      console.log(value)
      
    } catch (error) {
      setErrorMessage(error.toString());
    }
  }

  return (
    <Card className="w-[400px] h-[800px] mx-auto">
      <CardHeader >
        <CardTitle style={{ fontSize: '30px' }}>
          SpectraDerma Connection
        </CardTitle>
        <CardDescription style={{ fontSize: '16px' }}>
            <p>Connect to your device via BLE</p>
        </CardDescription>
      </CardHeader>
        
      <CardContent >
      <div>
          <p>Ensure that the device is powered on and in pairing mode</p>
          <p className="flex justify-center text-lg text-gray-700">
            {isConnected ? `Connected to: ${devices}` : 'No device connected'}
          </p>
        </div>

        <div>
          <span
            className={`inline-block py-2 px-4 rounded-full text-white ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <Button onClick={handleScan}
        className="bg-black text-white py-2 px-6  border-2 border-black hover:text-black transition-all duration-300">
        {isConnected ? 'Reconnect' : 'Connect to SpectraDerma'}
        </Button>

      </CardContent>
      <CardFooter>
      {errorMessage && (
        <p style={{ color: 'red' }}>Error: {errorMessage}</p>
      )}
      </CardFooter>
    </Card>
    );
  }
  
