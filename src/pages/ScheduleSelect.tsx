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
import './ScheduleSelect.css';

// import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial'
import { BleClient } from '@capacitor-community/bluetooth-le';
import { useEffect, useState } from 'react';
import { BarcodeFormat, BarcodeScanner} from '@capacitor-mlkit/barcode-scanning'

import { BluetoothDevice, DeviceProps } from '../types/device'

import DispenserAPI from '../api/dispenser'
import { Route, RouteComponentProps } from 'react-router';
import DeviceDetail from './DeviceDetail';

interface ScheduleSelectProps
{
  devices: BluetoothDevice[], 
  selectedDevice: BluetoothDevice | null,
  onSelectDevice: any,
  dispensers: any[],
  onGetDispensers: any,
  isConnected: boolean,
}

const ScheduleSelect: React.FC<ScheduleSelectProps> = (props: ScheduleSelectProps) => {
  const [devices, setDevices] = useState(props.devices)
  const [selectedDevice, setSelectedDevice] = useState(props.selectedDevice)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAddDevice, setAddDevice] = useState(false)
  const [dispenser, setDispenser] = useState<any>(null)
  const [dispenserName, setDispenserName] = useState<string | null | undefined>(null)

  // console.log("match: ", props)

  useEffect(() => {
    props.onGetDispensers();

    // setDevices([
    //   {
    //     id: '34:86:5D:B7:F1:02',
    //     name: 'test',
    //     address: '34:86:5D:B7:F1:02'
    //   }
    // ])
  }, [])

  useEffect(() => {
    if (!props.selectedDevice) {
      setSelectedDevice(null)
    }
  }, [props.selectedDevice])


  async function handleRefresh(event: CustomEvent<RefresherEventDetail> | null) {
    event == null ? setLoading(true) : null

    await props.onGetDispensers()
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
          <IonTitle>Schedule</IonTitle>
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
            <IonTitle size="large">Schedule</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid>
          <IonRow>
            {props.dispensers.map((dispenser: any, i) =>  {
              const found = devices.find(x => x.address == dispenser.dispenserId.macAddress)
              return (
                <IonCol size='6' key={i}>
                  <IonCard color="light" routerLink={`/schedule/${dispenser.dispenserId.macAddress}`}>
                  {/* <IonCardHeader style={found ? {color: 'white'} : {color: 'gray'}}>
                    <IonIcon icon={bulbOutline} size="large"  />
                    <IonCardTitle>{dispenser.dispenserId.name}</IonCardTitle>
                    <IonCardSubtitle>{dispenser.dispenserId.macAddress}</IonCardSubtitle>
                  </IonCardHeader> */}

                  {/* <IonCardContent>Card Content</IonCardContent> */}
                      <IonGrid style={found ? {color: 'black'} : {color: '#aaa'}}>
                        <IonRow style={{height: '200px'}} className="ion-text-center">
                          <IonCol>
                            <IonIcon className="ion-margin-top" icon={bulbOutline} size="large" color={found ? 'warning' : 'medium'} />
                            <IonCardTitle style={{fontSize: '20px'}} className="ion-margin-top">{dispenser.dispenserId.name}</IonCardTitle>
                            <IonCardSubtitle style={{marginTop: '10px'}}>{dispenser.dispenserId.macAddress}</IonCardSubtitle> <br />
                            { props.isConnected && props.selectedDevice?.address == dispenser.dispenserId.macAddress ? 
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

export default ScheduleSelect;
