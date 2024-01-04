import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonBackButton, IonCardTitle, IonCol, IonContent, IonDatetime, IonDatetimeButton, IonGrid, IonHeader, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import './Settings.css';
import { BluetoothDevice, DeviceData, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC } from '../types/device';
import moment from 'moment';
import { useEffect, useState } from 'react';
// import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial';
import { BleClient, dataViewToText, textToDataView } from '@capacitor-community/bluetooth-le';

interface SettingsProps {
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onConnected(device: BluetoothDevice | null): any,
  deviceData: DeviceData | null,
  onUpdateData(): any,
  onSetLoading(val: boolean): any,
  dispenser: any,
}
const Settings: React.FC<{
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onConnected(device: BluetoothDevice | null): any,
  deviceData: DeviceData | null,
  onUpdateData(): any,
  onSetLoading(val: boolean): any,
  dispenser: any,
}> = (props: SettingsProps) => {

  const [sprayPress, setSprayPress] = useState<number | null>(null)
  const [pauseSpray, setPauseSpray] = useState<number | null>(null)

  useEffect(() => {
    setSprayPress(null)
    setPauseSpray(null)
  }, [props.isConnected])

  const connectDevice = () => {
    if (props.selectedDevice) {
      props.onConnected(props.selectedDevice)
    } else {
      alert("Please select the device first.")
    }
  }

  const syncClock = async () => {
    const currentDate = moment().format("YYYY-MM-DD HH:mm:ss")

    // console.log('unixDate: ', unixDate)
    const canisterSno = props.dispenser.latestcanister.length > 0 ? props.dispenser.latestcanister[0].canisterId.serialNumber : ""
    const dispenserSno = props.dispenser.dispenserId.serialNumber ? props.dispenser.dispenserId.serialNumber : ""
    const dispLimit = props.dispenser.latestcanister.length > 0 ? props.dispenser.latestcanister[0].canisterId.initialSprays : ""

    if (confirm("Confirm to sync the settings?")) {
      if (props.selectedDevice) {
        const jsonData = {
          time: currentDate,
          dispenser: dispenserSno,
          canister: canisterSno,
          dispense_limit: dispLimit
        }
        const syncData = `SYNC:${JSON.stringify(jsonData)}#`
        await BleClient.write(props.selectedDevice.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView(syncData))
        // await BluetoothSerial.write(`SYNC:${unixDate},${dispenserSno},${canisterSno},${dispLimit}`)
        props.onSetLoading(true)
      }
    }
  }

  const updateData = async () => {
    let newSprayPress = props.deviceData ? sprayPress ? sprayPress : props.deviceData.sprayPressDuration : null
    let newPauseSpray = props.deviceData ? pauseSpray ? pauseSpray : props.deviceData.pauseBetweenSpray : null

    if (props.deviceData) {
      if (
        props.deviceData.sprayPressDuration != newSprayPress ||
        props.deviceData.pauseBetweenSpray != newPauseSpray
      ) {
        if (confirm("Confirm to update the settings?")) {
          if (props.selectedDevice) {
            const jsonData = {
              spray_press_duration: newSprayPress,
              pause_between_spray: newPauseSpray
            }
            const syncData = `SET:${JSON.stringify(jsonData)}#`
            await BleClient.write(props.selectedDevice.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView(syncData))
            // await BluetoothSerial.write(`SYNC:${unixDate},${dispenserSno},${canisterSno},${dispLimit}`)
            props.onSetLoading(true)
          }
          // await BluetoothSerial.write(`SET:${newSprayPress},${newPauseSpray}`)
          // props.onSetLoading(true)
        }
      }
    }

  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Settings</IonTitle>
          <IonButtons slot='start'>
            {/* <IonMenuButton></IonMenuButton> */}
            <IonBackButton></IonBackButton>
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
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        { props.isConnected && props.deviceData && props.deviceData.isSync == 1 &&
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Device: {props.deviceData ? props.deviceData.id : ""}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>Device Clock</IonLabel>
                    <IonLabel>{props.deviceData ? moment.unix(props.deviceData.currentTime).utc().format("DD/MM/YY, h:mm A") : ""}</IonLabel>
                  </IonItem>
                  
                </IonList>
              </IonCardContent>
              <IonButton onClick={syncClock}>SYNC</IonButton>
            </IonCard>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Device Settings</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>Spray Press Duration (ms)</IonLabel>
                    <IonInput onIonInput={(e: any) => setSprayPress(e.target.value)} type="number" placeholder="0" value={props.deviceData ? sprayPress ? sprayPress : props.deviceData.sprayPressDuration : null}></IonInput>
                  </IonItem>

                  <IonItem>
                    <IonLabel>Pause Between Spray (ms)</IonLabel>
                    <IonInput onIonInput={(e: any) => setPauseSpray(e.target.value)} type="number" placeholder="0" value={props.deviceData ? pauseSpray ? pauseSpray : props.deviceData.pauseBetweenSpray : null}></IonInput>
                  </IonItem>
                </IonList>
              </IonCardContent>
              <IonButton onClick={updateData}>Save</IonButton>
            </IonCard>
          </>
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

export default Settings;
