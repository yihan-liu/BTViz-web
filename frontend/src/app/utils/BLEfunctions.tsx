"use client"; 

/**
 * Requests a BLE device by name, optionally including additional services.
 * @param deviceName - The exact device name to filter for.
 * @param optionalServiceUUIDs - An array of service UUIDs (16-bit or 128-bit) to be requested.
 * @returns A Promise that resolves to the found BluetoothDevice.
 */
export async function requestDeviceByName(
    deviceName: string,
    optionalServiceUUIDs: number | string
): Promise<BluetoothDevice> {
    if (typeof navigator === "undefined" || !navigator.bluetooth) {
        throw new Error("Web Bluetooth is not supported in this browser/environment.");
    }

    try {
        const device = await navigator.bluetooth.requestDevice({
            filters: [{ name: deviceName }],
            optionalServices: [optionalServiceUUIDs],
        });
        return device;
    } catch (error: any) {
        throw new Error(`Error requesting device: ${error.message}`);
    }
}

/**
 * Connects to the GATT server of a given BluetoothDevice.
 * @param device - The BluetoothDevice to connect to.
 * @returns A Promise that resolves to the BluetoothRemoteGATTServer.
 */
export async function connectGATT(
    device: BluetoothDevice
): Promise<BluetoothRemoteGATTServer> {
    if (!device) {
        throw new Error("No device provided.");
    }
    try {
        const server = await device.gatt!.connect();
        return server;
    } catch (error: any) {
        throw new Error(`Failed to connect to GATT server: ${error.message}`);
    }
}

/**
 * Retrieves the primary service on a given GATT server.
 * @param server - The BluetoothRemoteGATTServer.
 * @param serviceUUID - A 16-bit or 128-bit service UUID.
 * @returns A Promise that resolves to the BluetoothRemoteGATTService.
 */
export async function getPrimaryService(
    server: BluetoothRemoteGATTServer,
    serviceUUID: number | string
): Promise<BluetoothRemoteGATTService> {
    if (!server) {
        throw new Error("No GATT server provided.");
    }

    try {
        const service = await server.getPrimaryService(serviceUUID);
        return service;
    } catch (error: any) {
        throw new Error(`Failed to get primary service: ${error.message}`);
    }
}

/**
 * Retrieves a characteristic from the specified service.
 * @param service - The BluetoothRemoteGATTService.
 * @param characteristicUUID - A 16-bit or 128-bit characteristic UUID.
 * @returns A Promise that resolves to the BluetoothRemoteGATTCharacteristic.
 */
export async function getCharacteristic(
    service: BluetoothRemoteGATTService,
    characteristicUUID: number | string
): Promise<BluetoothRemoteGATTCharacteristic> {
    if (!service) {
        throw new Error("No GATT service provided.");
    }

    // const device = characteristic.service?.device;
    // if (!device || !device.gatt.connected) {
    //     throw new Error("Device is not connected.");
    // }

    try {
        const characteristic = await service.getCharacteristic(characteristicUUID);
        return characteristic;
    } catch (error: any) {
        throw new Error(`Failed to get characteristic: ${error.message}`);
    }
}

/**
 * Reads a value from the provided characteristic.
 * @param characteristic - The BluetoothRemoteGATTCharacteristic.
 * @returns A Promise that resolves to the DataView containing the characteristic data.
 */
export async function readCharacteristicValue(
    characteristic: BluetoothRemoteGATTCharacteristic
): Promise<BluetoothRemoteGATTCharacteristic> {
    if (!characteristic) {
        throw new Error("No characteristic provided.");
    }

    const device = characteristic.service?.device;
    if (!device || !device?.gatt?.connected) {
        throw new Error("Device is not connected.");
    }

    try {
        // Start notifications and wait for the promise to resolve.

        const notifiedCharacteristic = await characteristic.startNotifications();
        console.log("Notifications Started!");

        // Add an event listener to log each notification as it arrives.
        return notifiedCharacteristic;
    } catch (error) {
        console.error("Error starting notifications:", error);
        throw error;
    }
}
/**
 * Utility to convert a DataView to a numeric array for logging or processing.
 * @param dataView - The DataView containing bytes.
 * @returns A number[] array of the bytes.
 */
export function dataViewToArray(dataView: DataView): number[] {
    // Option 1: Loop
    const array: number[] = [];
    for (let i = 0; i < dataView.byteLength; i++) {
        array.push(dataView.getUint8(i));
    }
    return array;
}

/**
 * Utility to connect to SpectraDerma from start to finish.
 * @param deviceName - The exact name to filter by
 * @param optionalServiceUUID - the service we are looking for 
 * @param CharacteristicUUID - the characteristic we want from the service
 * @returns returns a characteristic whose value can be read
 */
export async function connectToDevice(
    deviceName: string,
    optionalServiceUUID: number | string,
    serviceUUID: number | string
): Promise<BluetoothRemoteGATTCharacteristic>{
    try {
        const device = await requestDeviceByName(deviceName, optionalServiceUUID);
        const server = await connectGATT(device);
        const service = await getPrimaryService(server, optionalServiceUUID)
        console.log("All characteristics: ", await getAllCharacteristics(service));
        return await getCharacteristic(service, serviceUUID);
    } catch (error: any) {
        return (error.message || error.toString());
    }
}

/**
 * Utility to list all possible devices.
 * @returns returns BluetoothDevice that can be used to connect to any device.
 */
export async function getAllDevices(): Promise<BluetoothDevice> {
    if (typeof navigator === "undefined" || !navigator.bluetooth) {
        throw new Error("Web Bluetooth is not supported in this browser/environment.");
    }

    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true, // Accept any device
        });
        return device;
    } catch (error: any) {
        throw new Error("Error requesting device: ${ error.message }");
    }
}
/**
 * Retrieves all primary services available on a connected BluetoothDevice.
 * @param server - The BluetoothRemoteGATTServer to query for services.
 * @returns A Promise that resolves to an array of BluetoothRemoteGATTService.
 */
export async function getAllServices(
    server: BluetoothRemoteGATTServer
): Promise<BluetoothRemoteGATTService[]> {
    if (!server) {
        throw new Error("Device GATT is not available.");
    }
    // Ensure the device is connected
    if (!server.connected) {
        await server.connect();
    }

    try {
        // Calling getPrimaryServices without a filter returns all primary services.
        const services = await server.getPrimaryServices();
        console.log("Found services:", services);
        return services;
    } catch (error: any) {
        throw new Error(`Failed to get primary services: ${error.message}`);
    }
}



/**
 * Util to retrieve all characteristics from a given service.
 * @param service - The bluetooth serivce to query for characteristics.
 * @returns A promise that resolves to an array of BluetoothRemoteGATTCharacteristic objects.
 */
export async function getAllCharacteristics(
    service: BluetoothRemoteGATTService
): Promise<BluetoothRemoteGATTCharacteristic[]> {
  if (!service) {
    throw new Error("No blueooth service provided");
  }  
  try {
    const characteristics = await service.getCharacteristics();
    return characteristics;
  } catch (error: any) {
    throw new Error(`Failed to get characteristics: ${error.message}`);
  }
}
