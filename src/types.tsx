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
  currentTime: number,
  startDate: number,
  endDate: number,
  interval: number,
  nextInterval: number,
  lastInterval: number,
  counter: number,
  status: number,
}