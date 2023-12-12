export interface BluetoothDevice {
  class: number;
  id: string;
  address: string;
  name: string;
}

export interface DeviceProps {
  devices: BluetoothDevice[],
  selectedDevice: BluetoothDevice | null,
  onSelectDevice(device: BluetoothDevice): any,
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