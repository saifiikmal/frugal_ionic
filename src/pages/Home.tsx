import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonLabel, IonLoading, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import './Home.css';
import { BluetoothDevice, DeviceData } from '../types/device';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';

interface HomeProps {
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onConnected(device: BluetoothDevice | null): any,
  deviceData: DeviceData | null,
  onSetLoading(val: boolean): any,
  dispenser: any,
}

const Home: React.FC<{
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onConnected(device: BluetoothDevice | null): any,
  deviceData: DeviceData | null,
  onSetLoading(val: boolean): any,
  dispenser: any
}> = (props: HomeProps) => {

  useEffect(() => {

  })

  const connectDevice = () => {
    if (props.selectedDevice) {
      props.onConnected(props.selectedDevice)
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
        { props.isConnected && props.deviceData && props.deviceData.isSync == 1 && <IonGrid>
          <IonRow>
            <IonCol size='5'>
              Device ID
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.id : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Dispenser Serial No.
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.dispenserSno : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Canister Serial No.
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.canisterSno : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Device Clock
            </IonCol>
            <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.currentTime).format("DD/MM/YY, h:mm A") : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Last Dispense
            </IonCol>
            <IonCol size='7'>{props.deviceData && props.deviceData.lastDispense > 0 ? moment.unix(props.deviceData.lastDispense).format("DD/MM/YY, h:mm A") : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Last Dispense Counter
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.lastDispenseCounter : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Overall Counter
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.counter : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Dispense Limit
            </IonCol>
            <IonCol size='7'>{props.dispenser && props.dispenser.latestcanister.length > 0 ? props.dispenser.latestcanister[0].canisterId.initialSprays : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Dispenser Status
            </IonCol>
            <IonCol size='7'>{props.deviceData ? props.deviceData.status == 0 ? "Off" : "On" : ""}</IonCol>
          </IonRow>
          </IonGrid>
        }
        { 
          props.isConnected && props.deviceData && props.deviceData.isSync == 0 && 
          <IonGrid>
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Please sync to activate the device.</IonLabel>
              </IonCol>
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
