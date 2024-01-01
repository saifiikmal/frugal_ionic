import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar, 
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonButtons,
  IonGrid,
  IonRow,
  IonCol,
  IonMenuButton,
  IonNote,
  IonLoading, 
} from '@ionic/react';
import { checkmark } from 'ionicons/icons';
import './Devices.css';

// import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial'
import { BleClient } from '@capacitor-community/bluetooth-le';
import { useEffect, useState } from 'react';

import { BluetoothDevice, DeviceProps } from '../types/device'

const Devices: React.FC<{
  devices: BluetoothDevice[], 
  selectedDevice: BluetoothDevice | null,
  onSelectDevice: any,
}> = (props: DeviceProps) => {
  const [devices, setDevices] = useState(props.devices)
  const [selectedDevice, setSelectedDevice] = useState(props.selectedDevice)
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    
  }, [])

  useEffect(() => {
    if (!props.selectedDevice) {
      setSelectedDevice(null)
    }
  }, [props.selectedDevice])

  const scanDevices = async () => {
    if (!isScanning) {
      // setIsScanning(true)
      // const list = await BluetoothSerial.list();
      // setDevices(list)
      // setIsScanning(false)
      try {
        await BleClient.initialize();

        // const device = await BleClient.requestDevice({
        //   services: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"],
        // });

        // console.log("ble device: ", device)
        setIsScanning(true)
        const list: BluetoothDevice[] = []

        await BleClient.requestLEScan(
          {
            // services: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"],
            name: 'Frugal'
          },
          (result) => {
            console.log('received new scan result', result);
            list.push({
              id: result.device.deviceId,
              address: result.device.deviceId,
              name: result.localName ? result.localName : "Unknown"
            })
          }
        );
        setTimeout(async () => {
          await BleClient.stopLEScan();
          console.log('stopped scanning');
          setDevices(list)
          setIsScanning(false)
        }, 5000);
      } catch (err) {
        console.error(err)
      }
    }
  }

  const selectDevice = (val: BluetoothDevice) => {
    setSelectedDevice(val)
    props.onSelectDevice(val)
  }
  return (
    <IonPage>
      <IonLoading isOpen={isScanning} />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Devices</IonTitle>
          <IonButtons slot='start'>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonButtons slot="end" style={{ marginRight: '15px'}}>
            <IonButton fill="solid" color={'primary'} onClick={scanDevices}>
              { isScanning ? 'Scanning...' : 'Scan' }
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Devices</IonTitle>
          </IonToolbar>
        </IonHeader>
        { devices.length > 0 &&
          <IonList inset={true}>
            {devices.map(device => 
              <IonItem key={device.id} onClick={() => selectDevice(device)}>
                <IonLabel>{device.name}<br />
                <IonNote style={{ marginTop: 5}}>{device.address}</IonNote>
                </IonLabel>
                {selectedDevice != null && device.id === selectedDevice.id && <IonIcon slot='end' icon={checkmark} color={'success'}/>}
              </IonItem>
            )}
          </IonList>
        }
        { devices.length == 0 &&
          <IonGrid> 
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Please click scan to get devices.</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        }
      </IonContent>
    </IonPage>
  );
};

export default Devices;
