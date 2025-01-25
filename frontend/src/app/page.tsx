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
    <Card>
      <CardHeader >
        <CardTitle className="text-2xl">
          SpectraDerma Connection
        </CardTitle>
        <CardDescription>
          Connects to SpectraDerma via BLE 
        </CardDescription>
      </CardHeader>
        
      <CardContent>
      <div>
          <p className="text-lg text-gray-700">
            {devices ? `Connected to: ${devices}` : 'No device connected'}
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
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 focus:ring-2 focus:ring-blue-400"> 
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
  
