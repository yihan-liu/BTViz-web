"use client"
import { useState } from 'react';

export default function Home() {
  const [devices, setDevices] = useState("");
  const [errorMessage, setErrorMessage] = useState('');

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
    <div style={{ padding: 20 }}>
      <h1>Battery Level BLE Demo</h1>
      <button onClick={handleScan}>Scan &amp; Get Battery Level</button>

      {errorMessage && (
        <p style={{ color: 'red' }}>Error: {errorMessage}</p>
      )}
    </div>
  );
}