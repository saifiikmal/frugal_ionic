import { IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonBackButton, IonLabel, IonLoading, IonMenuButton, IonPage, IonRow, IonTitle, IonToolbar, IonCard, IonIcon, IonCardTitle, IonCardSubtitle } from '@ionic/react';
import './Dashboard.css';
import { BluetoothDevice, DeviceData } from '../types/device';
import { useEffect, useRef, useState } from 'react';
import moment from 'moment';

import DispenserAPI from '../api/dispenser'
import { RouteComponentProps } from 'react-router';
import { batteryChargingOutline, bulbOutline, heartOutline, timeOutline } from 'ionicons/icons';

interface DashboardProps
  extends RouteComponentProps<{
    id: string;
  }> {}

const Dashboard: React.FC<DashboardProps> = ({ match }) => {
  const [dispenser, setDispenser] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // console.log('match: ', match.params.id)
    getDispenser()
  }, [])

  const getDispenser = async () => {
    setLoading(true)
    try {
      const resp = await DispenserAPI.getDispenserByMacAddress(match.params.id)

      if (resp.data) {
        console.log(resp.data)
        setDispenser(resp.data)
      }
      // setLoading(false)
    } catch (err) {
      // setLoading(false)
      alert(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <IonPage>
      <IonLoading isOpen={loading} />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Dashboard</IonTitle>
          <IonButtons slot='start'>
            {/* <IonMenuButton></IonMenuButton> */}
            <IonBackButton></IonBackButton>
          </IonButtons>
          {/* <IonButtons slot="end" style={{ marginRight: '15px'}}>
            <IonButton fill="solid" color={'primary'} onClick={connectDevice}>
              { props.isConnected ? 'Disconnect' : 'Connect' }
            </IonButton>
          </IonButtons> */}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Dashboard</IonTitle>
          </IonToolbar>
        </IonHeader>
        { dispenser && <>
          <IonGrid>
            <IonRow>
              <IonCol size="6">
                <IonCard color="light">
                  <IonGrid>
                    <IonRow style={{height: '100px'}} className="ion-text-center">
                      <IonCol>
                        {/* <IonIcon className="ion-margin-top" icon={bulbOutline} size="large" color='warning' /> */}
                        <IonCardTitle className="ion-margin-top">{dispenser.dispenserId.name}</IonCardTitle>
                        <IonCardSubtitle style={{marginTop: '10px'}}>{dispenser.dispenserId.macAddress}</IonCardSubtitle><br />
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
          </IonRow>
          <IonRow className="ion-margin-top">
            <IonCol>
              <IonCard color="primary" style={{ height: '160px'}}>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={heartOutline} size='large' /> <br />
                    <IonCardTitle className="ion-margin-top">{
                    dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.remainingSprays : 0
                    } 
                    </IonCardTitle>
                    <IonCardSubtitle style={{ marginTop: '7px'}}>Remaining spray</IonCardSubtitle>
                  </IonCol>
                  {/* <IonCol size="6" className='ion-margin'>
                    <IonCardTitle>Devices
                      
                    </IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
            <IonCol>
              <IonCard color="success" style={{ height: '160px'}}>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={batteryChargingOutline} size='large' /> <br />
                    <IonCardTitle className="ion-margin-top">{
                    dispenser.latestcanister.length > 0 ? Math.round((dispenser.latestcanister[0].canisterId.remainingSprays / dispenser.latestcanister[0].canisterId.initialSprays) * 100) : 0
                    } %
                    </IonCardTitle>
                    <IonCardSubtitle style={{ marginTop: '7px'}}>Battery</IonCardSubtitle>
                  </IonCol>
                  {/* <IonCol size="6" className='ion-margin'>
                    <IonCardTitle>Devices
                      
                    </IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonCard color="tertiary" style={{ height: '160px'}}>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={timeOutline} size='large' /> <br />
                    <IonCardTitle className="ion-margin-top">{
                    dispenser.dispenserId.lastSprayDate ? moment(dispenser.dispenserId.lastSprayDate).utc().format("DD/MM/YY, h:mm A") : "-"
                    } 
                    </IonCardTitle>
                    <IonCardSubtitle style={{ marginTop: '7px'}}>Last Spray</IonCardSubtitle>
                  </IonCol>
                  {/* <IonCol size="6" className='ion-margin'>
                    <IonCardTitle>Devices
                      
                    </IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
            <IonCol>
              {/* <IonCard color="secondary" style={{ height: '160px'}}>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={batteryChargingOutline} size='large' /> <br />
                    <IonCardTitle className="ion-margin-top">{
                    dispenser.dispenserId.batteryLevel
                    } %
                    </IonCardTitle>
                    <IonCardSubtitle style={{ marginTop: '7px'}}>Battery</IonCardSubtitle>
                  </IonCol>
                  
                </IonRow>
                
              </IonCard> */}
            </IonCol>
          </IonRow>
        </IonGrid>
        
        </>}
        
        {/* { props.isConnected && props.selectedDevice && props.deviceData && props.deviceData.isSync == 1 && <IonGrid>
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
            <IonCol size='7'>{props.deviceData ? moment.unix(props.deviceData.currentTime).utc().format("DD/MM/YY, h:mm A") : ""}</IonCol>
          </IonRow>
          <IonRow>
            <IonCol size='5'>
              Last Dispense
            </IonCol>
            <IonCol size='7'>{props.deviceData && props.deviceData.lastDispense > 0 ? moment.unix(props.deviceData.lastDispense).utc().format("DD/MM/YY, h:mm A") : ""}</IonCol>
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
          props.isConnected && props.deviceData && props.selectedDevice && props.deviceData.isSync == 0 && 
          <IonGrid>
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Please sync to activate the device.</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        }
        { 
          props.dispenser && props.selectedDevice && !props.isConnected && 
          <IonGrid>
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Please connect to the device.</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        }
        { 
          props.selectedDevice && props.isConnected && !props.dispenser  && 
          <IonGrid>
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Unregistered device. Please make sure you have registered the device.</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        }
        { 
          !props.isConnected && !props.selectedDevice  && 
          <IonGrid>
            <IonRow>
              <IonCol className='ion-padding'>
                <IonLabel>Please select the device first.</IonLabel>
              </IonCol>
            </IonRow>
          </IonGrid>
        } */}
      </IonContent>
    </IonPage>
  );
};

export default Dashboard;
