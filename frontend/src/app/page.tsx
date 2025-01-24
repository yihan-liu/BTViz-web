"use client"
import { useState } from 'react';
import { connectToDevice, dataViewToArray, readCharacteristicValue } from './utils/BLEfunctions';

export default function Home() {

  // global consts do not touch
  const deviceName: string = "SpectraDerma"
  const optionalServiceUUID: number = 0xACEF
  const optionalCharacteristicUUID: number = 0xFF01
  
  // 
  
  async function handleScan() {
    const characteristic = await connectToDevice(deviceName, optionalServiceUUID, optionalCharacteristicUUID);
    console.log(characteristic);
    const value = await readCharacteristicValue(characteristic);
    console.log(value)
    const arr = dataViewToArray(value)
    console.log(arr);
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Battery Level BLE Demo</h1>
      <button onClick={handleScan}>Scan &amp; Get Battery Level</button>
    </div>
  );
}