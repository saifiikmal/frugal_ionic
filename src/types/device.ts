export interface BluetoothDevice {
  // class: number;
  id: string;
  address: string;
  name: string;
}

export interface DeviceProps {
  devices: BluetoothDevice[],
  selectedDevice: BluetoothDevice | null,
  onSelectDevice(device: BluetoothDevice): any,
  dispensers: any[],
  onGetDispensers(): any,
  isConnected: boolean,
  testSpray: any,
}

export interface DeviceData {
  id: string,
  dispenserSno: string,
  canisterSno: string,
  currentTime: number,
  sprayPressDuration: number,
  pauseBetweenSpray: number,
  lastDispense: number,
  lastDispenseCounter: number,
  counter: number,
  dispenseLimit: number,
  status: number,
  isSync: number,
}

export const FRUGAL_SERVICE = "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
export const FRUGAL_CHARACTERISTIC = "beb5483e-36e1-4688-b7f5-ea07361b26a8"