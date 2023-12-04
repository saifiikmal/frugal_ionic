import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonLabel, IonLoading, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { BluetoothDevice, DeviceData } from '../types/device';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';
import DispenserAPI from '../api/dispenser'

import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial'

interface HomeProps {
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onConnected(): any,
  deviceData: DeviceData | null,
  onSetLoading(val: boolean): any,
  dispenser: any,
}

const Home: React.FC<{
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onConnected(): any,
  deviceData: DeviceData | null,
  onSetLoading(val: boolean): any,
  dispenser: any
}> = (props: HomeProps) => {
  // const [isConnected, setConnected] = useState(props.isConnected)

  useEffect(() => {
    console.log('isConnected: ', props.isConnected)
    console.log('selectedDevice: ', props.selectedDevice)
  })

  const connectDevice = () => {
    if (props.selectedDevice) {
      props.onConnected()
    } else {
      alert("Please select the device first.")
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
          <IonButtons slot='start'>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonButtons slot="end" style={{ marginRight: '15px'}}>
            <IonButton fill="solid" color={'primary'} onClick={connectDevice}>
              { props.isConnected ? 'Disconnect' : 'Connect' }
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* <ExploreContainer name="Tab 2 page" /> */}
          { props.isConnected && <IonGrid>
          <IonRow>
            <IonCol size='5'>
              Device ID
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.id : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Device Clock
            </IonCol>
            <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.currentTime).format("DD/MM/YY, h:mm A") : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Start Date
            </IonCol>
            <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.startDate).format("DD/MM/YY, h:mm A") : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              End Date
            </IonCol>
            <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.endDate).format("DD/MM/YY, h:mm A") : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Interval (Seconds)
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.interval : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Last Interval
            </IonCol>
            <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.lastInterval).format("DD/MM/YY, h:mm A") : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Next Interval
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.nextInterval <= props.deviceData.endDate ? moment.unix(props.deviceData.nextInterval).format("DD/MM/YY, h:mm A") : "" : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Counter
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.counter : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Counter Status
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.status == 0 ? "Off" : "On" : ""}</IonCol>
          </IonRow>
          </IonGrid>
        }
        { 
          props.dispenser && !props.isConnected && 
          <IonGrid>
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Please connect to the device.</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        }
        { 
          props.selectedDevice && !props.dispenser  && 
          <IonGrid>
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Unregistered device. Please make sure you have registered the device.</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        }
        { 
          !props.selectedDevice  && 
          <IonGrid>
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Please select the device first.</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        }
      </IonContent>
    </IonPage>
  );
};

export default Home;
