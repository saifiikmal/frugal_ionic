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
  IonBackButton,
  IonNote,
  IonLoading, 
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonRouterOutlet,
  IonModal,
  IonInput,
  IonFab,
  IonFabButton,
  IonAlert,
  IonBadge,
} from '@ionic/react';
import { checkmarkOutline, bulbOutline, add } from 'ionicons/icons';
import './Devices.css';

// import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial'
import { BleClient } from '@capacitor-community/bluetooth-le';
import { useEffect, useRef, useState } from 'react';
import { BarcodeFormat, BarcodeScanner} from '@capacitor-mlkit/barcode-scanning'

import { BluetoothDevice, DeviceProps } from '../types/device'

import DispenserAPI from '../api/dispenser'
import { Route, useHistory } from 'react-router';
import DeviceDetail from './DeviceDetail';

interface ConnectDeviceProps {
  devices: BluetoothDevice[], 
  selectedDevice: BluetoothDevice | null,
  onSelectDevice: any,
  isConnected: boolean,
  onConnected(device: BluetoothDevice | null): any,
  onDisconnected(device: BluetoothDevice | null): any,
  onSetLoading(val: boolean): any,
  onScanDevices: any,
  dispensers: any[],
}

const Devices: React.FC<{
  devices: BluetoothDevice[], 
  selectedDevice: BluetoothDevice | null,
  onSelectDevice: any,
  isConnected: boolean,
  onConnected(device: BluetoothDevice | null): any,
  onDisconnected(device: BluetoothDevice | null): any,
  onSetLoading(val: boolean): any,
  onScanDevices: any,
  dispensers: any[],
}> = (props: ConnectDeviceProps) => {
  const history = useHistory();

  const [devices, setDevices] = useState(props.devices)
  const [selectedDevice, setSelectedDevice] = useState(props.selectedDevice)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAddDevice, setAddDevice] = useState(false)
  const [dispenser, setDispenser] = useState<any>(null)
  const [dispenserName, setDispenserName] = useState<string | null | undefined>(null)

  const prevConnected = useRef<any>()

  useEffect(() => {

    // setDevices([
    //   {
    //     id: '34:86:5D:B7:F1:02',
    //     name: 'test',
    //     address: '34:86:5D:B7:F1:02'
    //   }
    // ])
    // props.onScanDevices()
    handleRefresh(null)
    // const initializeBle = async () => {
    //   setInterval(async () => {
    //     props.onScanDevices()
    //   }, 10000)
    // }
    // initializeBle()
  }, [])


  // useEffect(() => {
  //   if (!props.selectedDevice) {
  //     setSelectedDevice(null)
  //   }
  // }, [props.selectedDevice])

  // useEffect(() => {
  //   if (props.selectedDevice && props.isConnected) {
  //     alert('Device successfully connected')
  //     history.push('/')
  //   }
  //   if (!props.selectedDevice && !props.isConnected) {
  //     alert('Device successfully disconnected')
  //     props.onScanDevices()
  //   }
  // }, [props.isConnected])


  useEffect(() => {
    if (prevConnected.current) {
      if (prevConnected.current.isConnected != props.isConnected
        || prevConnected.current.selectedDevice != props.selectedDevice) {
          if (!props.selectedDevice) {
            setSelectedDevice(null)
          }

          if (props.selectedDevice && props.isConnected) {
            alert('Device successfully connected')
            history.push('/')
          }
          if (!props.selectedDevice && !props.isConnected) {
            alert('Device successfully disconnected')
            props.onScanDevices()
          }
      }
    }

    prevConnected.current = {
      isConnected: props.isConnected,
      selectedDevice: props.selectedDevice
    }
  })
  

  const selectDevice = (val: BluetoothDevice) => {
    // props.onSelectDevice(val)
    console.log("connected: ", props.isConnected)
    console.log("selectedDevice: ", props.selectedDevice)

    const found = props.dispensers.find(x => x.dispenserId.macAddress == val.address)

    if (!found) {
      alert("Device not registered yet.")
      return;
    }

    if (props.isConnected) {
      if (props.selectedDevice?.address == val.address) {
        if (confirm("Are you sure you want to disconnect this device?")) {
          setSelectedDevice(null)
          props.onDisconnected(val)
          // alert('Device succesfully disconnected')
          // handleRefresh(null)
        }
      } else {
        alert("Please disconnect other device first")
        return;
      }
    } else {
      if (confirm("Are you sure you want to connect to this device?")) {
        setSelectedDevice(val)
        props.onSelectDevice(val)
        // alert('Device succesfully connected')
        // history.push('/')
      }
    }
  }

  async function handleRefresh(event: CustomEvent<RefresherEventDetail> | null) {
    event == null ? setLoading(true) : null

    await props.onScanDevices()
    // if (props.isConnected) await syncTimer()

    setTimeout(() => {
      // Any calls to load data go here
      event ? event.detail.complete() : setLoading(false)
    }, 2000);
  }

  return (
    <IonPage>
      {/* <IonRouterOutlet>
        <Route path="/devices/:id">
          <DeviceDetail />
        </Route>
      </IonRouterOutlet> */}
      <IonLoading isOpen={loading} />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connect Device</IonTitle>
          <IonButtons slot='start'>
            {/* <IonMenuButton></IonMenuButton> */}
            <IonBackButton></IonBackButton>
          </IonButtons>
          {/* <IonButtons slot="end" style={{ marginRight: '15px'}}>
            <IonButton fill="solid" color={'primary'} onClick={scanDevices}>
              { loading ? 'Scanning...' : 'Scan' }
            </IonButton>
          </IonButtons> */}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Devices</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            {props.devices.map((device: BluetoothDevice, i) =>  {
              return (
                <IonCol size='6' key={i}>
                  <IonCard color="light" onClick={() => selectDevice(device)}>
                  {/* <IonCardHeader style={found ? {color: 'white'} : {color: 'gray'}}>
                    <IonIcon icon={bulbOutline} size="large"  />
                    <IonCardTitle>{dispenser.dispenserId.name}</IonCardTitle>
                    <IonCardSubtitle>{dispenser.dispenserId.macAddress}</IonCardSubtitle>
                  </IonCardHeader> */}

                  {/* <IonCardContent>Card Content</IonCardContent> */}
                      <IonGrid>
                        <IonRow style={{height: '200px'}} className="ion-text-center">
                          <IonCol>
                            <IonIcon className="ion-margin-top" icon={bulbOutline} size="large" color='warning' />
                            <IonCardTitle style={{fontSize: '20px'}} className="ion-margin-top">{device.name}</IonCardTitle>
                            <IonCardSubtitle style={{marginTop: '10px'}}>{device.address}</IonCardSubtitle><br />
                            { props.isConnected && props.selectedDevice?.address == device.address ? 
                            <IonBadge color="success">Connected</IonBadge> : null }
                          </IonCol>
                          {/* <IonCol>
                            <IonCardTitle>{dispenser.dispenserId.name}</IonCardTitle>
                            <IonCardSubtitle style={{marginTop: '10px'}}>{dispenser.dispenserId.macAddress}</IonCardSubtitle>
                          </IonCol>
                          <IonCol>
                            { found ? <IonIcon icon={checkmarkOutline} size='large' color='success'></IonIcon> : null}
                          </IonCol> */}
                        </IonRow>
                      </IonGrid>
                  </IonCard>
              </IonCol>
              )
            }
                
              
            )}
              
            {props.devices.length == 0 ? <IonLabel className="ion-margin">No devices found</IonLabel> : null}
          </IonRow>
        </IonGrid>
        {/* { devices.length > 0 &&
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
        } */}
       
      </IonContent>
    </IonPage>
  );
};

export default Devices;
