"use client"
import { useState } from 'react';

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
  <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
    <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-4">SpectraDerma Connection</h2>

      <div className="text-center mb-4">
          <p className="text-lg text-gray-700">
            {devices ? `Connected to: ${devices}` : 'No device connected'}
          </p>
        </div>

        <div className="text-center mb-6">
          <span
            className={`inline-block py-2 px-4 rounded-full text-white ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        <button
          onClick={handleScan}
          className="w-full py-2 px-4 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 focus:outline-none"
        >
          {isConnected ? 'Reconnect' : 'Connect to SpectraDerma'}
        </button>

    <div style={{ padding: 20 }}>
    
      <h1>Battery Level BLE Demo</h1>
      <button onClick={handleScan}>Scan &amp; Get Battery Level</button>

      {errorMessage && (
        <p style={{ color: 'red' }}>Error: {errorMessage}</p>
      )}


      </div>
    </div>
    </div>
    );
  }
  
