import { 
  IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, 
  IonLabel, IonLoading, IonMenuButton, IonPage, IonRow, 
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent,
  IonIcon, IonRouterOutlet
 } from '@ionic/react';
import './Main.css';

import { bulbOutline, logInOutline, informationOutline, calendarOutline, settingsOutline, logOutOutline, bluetoothOutline, qrCodeOutline } from 'ionicons/icons';
import { useAuth } from '../context/authContext'

import { BluetoothDevice } from '../types/device'
import { useEffect, useRef } from 'react';

interface HomeProps {
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onDisconnected(device: BluetoothDevice | null): any,
}
const Home: React.FC<{
  selectedDevice: BluetoothDevice | null,
  isConnected: boolean,
  onDisconnected(device: BluetoothDevice | null): any,
}> = (props: HomeProps) => {
  const prevConnected = useRef<any>()
  const { user, logout } = useAuth();

  const logOut = async () => {

    if(confirm("Are you sure you want to sign out?")) {
     await logout()
    }
  }

  useEffect(() => {
    if (prevConnected.current) {
      if (prevConnected.current.isConnected != props.isConnected) {
          
          if (!props.isConnected) {
            alert('Device successfully disconnected')
          }
      }
    }

    prevConnected.current = {
      isConnected: props.isConnected,
    }
  })

  const disconnectDevice = async () => {
    if (confirm("Are you sure you want to disconnect this device?")) {
      props.onDisconnected(props.selectedDevice)
    }
  }
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Frugal</IonTitle>
          { props.isConnected && props.selectedDevice ? <IonButtons slot="end" style={{ marginRight: '15px'}}>
              <IonButton fill="solid" color={'primary'} onClick={() => disconnectDevice()}>
                Disconnect
              </IonButton>
            </IonButtons> : null }
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Frugal</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonGrid className='ion-margin-top'>
          <IonRow>
            <IonCol>
              <IonCard color="primary" style={{ height: '140px'}} routerLink='/devices'>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={bulbOutline} size='large' /> <br />
                    <IonCardTitle className="ion-margin-top">Devices
                      
                      </IonCardTitle>
                  </IonCol>
                  {/* <IonCol size="6" className='ion-margin'>
                    <IonCardTitle>Devices
                      
                    </IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
            <IonCol>
            <IonCard color="secondary" style={{ height: '140px'}} routerLink='/connect'>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol  style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={bluetoothOutline} size='large' /> <br />
                    <IonCardTitle className='ion-margin-top'>Connect Device</IonCardTitle>
                  </IonCol>
                  {/* <IonCol  className='ion-margin'>
                    <IonCardTitle className='ion-text-wrap'>Connect Device</IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
            <IonCard color="tertiary" style={{ height: '140px'}} routerLink='/dashboard'>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol  style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={informationOutline} size='large' /> <br />
                    <IonCardTitle className='ion-margin-top'>Dashboard</IonCardTitle>
                  </IonCol>
                  {/* <IonCol size="6" className='ion-margin'>
                    <IonCardTitle>Dashboard</IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
            <IonCol>
            <IonCard color="success" style={{ height: '140px'}} routerLink='/schedule'>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol  style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={calendarOutline} size='large' /> <br />
                    <IonCardTitle className='ion-margin-top'>Schedule</IonCardTitle>
                  </IonCol>
                  {/* <IonCol size="6" className='ion-margin'>
                    <IonCardTitle>Schedule</IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
            <IonCard color="warning" style={{ height: '140px'}} routerLink='/register'>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={qrCodeOutline} size='large' /><br />
                    <IonCardTitle className='ion-margin-top'>Register Canister</IonCardTitle>
                  </IonCol>
                  {/* <IonCol size="6" className='ion-margin' >
                    <IonCardTitle>Register</IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
            <IonCol>
            <IonCard color="danger" style={{ height: '140px'}} onClick={() => logOut()}>
                
                <IonRow style={{ height: '100%'}}>
                  <IonCol style={{ }} className='ion-margin ion-text-center'>
                    <IonIcon icon={logOutOutline} size='large' /><br />
                    <IonCardTitle className='ion-margin-top'>Sign Out</IonCardTitle>
                  </IonCol>
                  {/* <IonCol size="6" className='ion-margin'>
                    <IonCardTitle>Sign Out</IonCardTitle>
                  </IonCol> */}
                </IonRow>
                
              </IonCard>
            </IonCol>
          </IonRow>

          {/* <IonRow>
            <IonCol>
              <IonCard color="light">
                <IonCardHeader>
                  <IonCardTitle>Card Title</IonCardTitle>
                  <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
                </IonCardHeader>

                <IonCardContent>Card Content</IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol>
              <IonCard color="medium">
                <IonCardHeader>
                  <IonCardTitle>Card Title</IonCardTitle>
                  <IonCardSubtitle>Card Subtitle</IonCardSubtitle>
                </IonCardHeader>

                <IonCardContent>Card Content</IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow> */}
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default Home;