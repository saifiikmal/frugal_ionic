import { IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCol, IonContent, IonDatetime, IonDatetimeButton, IonGrid, IonHeader, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonModal, IonPage, IonRow, IonTitle, IonToolbar } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Settings.css';
import { BluetoothDevice, DeviceData } from '../types/device';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial';

interface SettingsProps {
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onConnected(): any,
  deviceData: DeviceData | null,
  onUpdateData(): any,
  onSetLoading(val: boolean): any,
  dispenser: any,
}
const Settings: React.FC<{
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onConnected(): any,
  deviceData: DeviceData | null,
  onUpdateData(): any,
  onSetLoading(val: boolean): any,
  dispenser: any,
}> = (props: SettingsProps) => {

  const [startDate, setStartDate] = useState<number | null>(null)
  const [endDate, setEndDate] = useState<number | null>(null)
  const [interval, setTimeInterval] = useState<number | null>(null)

  useEffect(() => {
    setStartDate(null)
    setEndDate(null)
    setTimeInterval(null)
  }, [props.isConnected])

  const connectDevice = () => {
    if (props.selectedDevice) {
      props.onConnected()
    } else {
      alert("Please select the device first.")
    }
  }

  const onChangeDate = (key: string, val: any) => {
    console.log('change:', val)
    const unixDate = moment(val, "YYYY-MM-DDTHH:mm:ss").unix()

    console.log('unixDate: ', unixDate)
    if (key === "startDate") {
      setStartDate(unixDate)
    }

    if (key === "endDate") {
      setEndDate(unixDate)
    }
  }

  const syncClock = async () => {
    const unixDate = moment().unix()

    console.log('unixDate: ', unixDate)
    await BluetoothSerial.write(`SYNC:${unixDate}`)
    props.onSetLoading(true)

  }

  const updateData = async () => {
    let newStartDate = props.deviceData ? startDate ? startDate : props.deviceData.startDate : null
    let newEndDate = props.deviceData ? endDate ? endDate : props.deviceData.endDate : null
    let newInterval = props.deviceData ? interval ? interval : props.deviceData.interval : null

    if (props.deviceData) {
      if (
        props.deviceData.startDate != newStartDate ||
        props.deviceData.endDate != newEndDate ||
        props.deviceData.interval != newInterval
      ) {
        if (confirm("Confirm to reset the settings?")) {
          await BluetoothSerial.write(`SET:${newStartDate},${newEndDate},${newInterval}`)
          props.onSetLoading(true)
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
            <IonTitle size="large">Settings</IonTitle>
          </IonToolbar>
        </IonHeader>
        {/* <ExploreContainer name="Settings" /> */}
        { props.isConnected && 
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Device: {props.deviceData ? props.deviceData.id : ""}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>Device Clock</IonLabel>
                    <IonLabel>{props.deviceData ? moment.unix(props.deviceData.currentTime).format("DD/MM/YY, h:mm A") : ""}</IonLabel>
                  </IonItem>
                  
                </IonList>
                {/* <IonGrid>
                  <IonRow>
                    <IonCol size='5'>
                      Device ID
                    </IonCol>
                    <IonCol size='7'>Clock</IonCol>
                  </IonRow>
                </IonGrid> */}
              </IonCardContent>
              <IonButton onClick={syncClock}>SYNC</IonButton>
            </IonCard>
            {/* <IonCard>
              <IonCardHeader>
                <IonCardTitle>Device Settings</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel>Start Date</IonLabel>
                    <IonDatetimeButton datetime="startDate"></IonDatetimeButton>

                    <IonModal keepContentsMounted={true}>
                      <IonDatetime onIonChange={e => onChangeDate("startDate", e.detail.value)} id="startDate" value={ props.deviceData ? startDate ? moment.unix(startDate).format("YYYY-MM-DDTHH:mm") : moment.unix(props.deviceData.startDate).format("YYYY-MM-DDTHH:mm") : null}></IonDatetime>
                    </IonModal>
                  </IonItem>

                  <IonItem>
                    <IonLabel>End Date</IonLabel>
                    <IonDatetimeButton datetime="endDate"></IonDatetimeButton>

                    <IonModal keepContentsMounted={true}>
                      <IonDatetime onIonChange={e => onChangeDate("endDate", e.detail.value)} id="endDate" value={ props.deviceData ? endDate ? moment.unix(endDate).format("YYYY-MM-DDTHH:mm") : moment.unix(props.deviceData.endDate).format("YYYY-MM-DDTHH:mm") : null}></IonDatetime>
                    </IonModal>
                  </IonItem>

                  <IonItem>
                    <IonLabel>Interval (Seconds)</IonLabel>
                    <IonInput onIonInput={(e: any) => setTimeInterval(e.target.value)} type="number" placeholder="0" value={props.deviceData ? interval ? interval : props.deviceData.interval : null}></IonInput>
                  </IonItem>
                </IonList>
              </IonCardContent>
              <IonButton onClick={updateData}>Save</IonButton>
            </IonCard> */}
          </>
        
        // <IonGrid>
        //   <IonRow>
        //     <IonCol size='5'>
        //       Device ID
        //     </IonCol>
        //     <IonCol size='7'>{props.deviceData ? props.deviceData.id : ""}</IonCol>
        //   </IonRow>
        //   <IonRow>
        //     <IonCol size='5'>
        //       Device Clock
        //     </IonCol>
        //     <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.currentTime).format("DD/MM/YY, h:mm A") : ""}</IonCol>
        //   </IonRow>
        //   <IonRow>
        //     <IonCol size='5'>
        //       Start Date
        //     </IonCol>
        //     <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.startDate).format("DD/MM/YY, h:mm A") : ""}</IonCol>
        //   </IonRow>
        //   <IonRow>
        //     <IonCol size='5'>
        //       End Date
        //     </IonCol>
        //     <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.endDate).format("DD/MM/YY, h:mm A") : ""}</IonCol>
        //   </IonRow>
        //   <IonRow>
        //     <IonCol size='5'>
        //       Interval (Minutes)
        //     </IonCol>
        //     <IonCol size='7'>{props.deviceData ? props.deviceData.interval : ""}</IonCol>
        //   </IonRow>

        //   </IonGrid>
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
