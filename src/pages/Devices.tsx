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
import { useEffect, useState } from 'react';
import { BarcodeFormat, BarcodeScanner} from '@capacitor-mlkit/barcode-scanning'

import { BluetoothDevice, DeviceProps } from '../types/device'

import DispenserAPI from '../api/dispenser'
import { Route } from 'react-router';
import DeviceDetail from './DeviceDetail';
import { Capacitor } from '@capacitor/core';

const Devices: React.FC<{
  devices: BluetoothDevice[], 
  selectedDevice: BluetoothDevice | null,
  onSelectDevice: any,
  dispensers: any[],
  onGetDispensers: any,
  isConnected: boolean,
  testSpray: any,
}> = (props: DeviceProps) => {
  const [devices, setDevices] = useState(props.devices)
  const [selectedDevice, setSelectedDevice] = useState(props.selectedDevice)
  const [loading, setLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isAddDevice, setAddDevice] = useState(false)
  const [dispenser, setDispenser] = useState<any>(null)
  const [dispenserName, setDispenserName] = useState<string | null | undefined>(null)

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

  // const scanDevices = async () => {
  //   if (!loading) {
  //     // setIsScanning(true)
  //     // const list = await BluetoothSerial.list();
  //     // setDevices(list)
  //     // setIsScanning(false)
  //     try {
  //       await BleClient.initialize();

  //       // const device = await BleClient.requestDevice({
  //       //   services: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"],
  //       // });

  //       // console.log("ble device: ", device)
  //       setLoading(true)
  //       const list: BluetoothDevice[] = []

  //       await BleClient.requestLEScan(
  //         {
  //           // services: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"],
  //           name: 'Frugal'
  //         },
  //         (result) => {
  //           console.log('received new scan result', result);
  //           list.push({
  //             id: result.device.deviceId,
  //             address: result.device.deviceId,
  //             name: result.localName ? result.localName : "Unknown"
  //           })
  //         }
  //       );
  //       setTimeout(async () => {
  //         await BleClient.stopLEScan();
  //         console.log('stopped scanning');
  //         setDevices(list)
  //         setLoading(false)
  //       }, 5000);
  //     } catch (err) {
  //       console.error(err)
  //     }
  //   }
  // }

  // const selectDevice = (val: BluetoothDevice) => {
  //   setSelectedDevice(val)
  //   props.onSelectDevice(val)
  // }

  async function handleRefresh(event: CustomEvent<RefresherEventDetail> | null) {
    event == null ? setLoading(true) : null

    await props.onGetDispensers()
    // if (props.isConnected) await syncTimer()

    setTimeout(() => {
      // Any calls to load data go here
      event ? event.detail.complete() : setLoading(false)
    }, 2000);
  }

  const editDevice = (dispenser: any) => {
    try {
      setDispenser(dispenser)
      setDispenserName(dispenser.dispenserId.name)
      setIsOpen(true)
    } catch (err) {

    }
  }

  const updateDevice = async () => {
    setLoading(true)
    try {
      if (dispenser) {
        const resp = await DispenserAPI.updateDispenser(dispenser.dispenserId.id, {
          name: dispenserName
        })
      }
      setLoading(false)
      setIsOpen(false)
      handleRefresh(null)
    } catch (err) {
      alert(err)
      setLoading(false)
    }
  }

  const handleQR = async () => {
    try {
      const { supported} = await BarcodeScanner.isSupported()
      // console.log('qr: ', supported)

      if (supported) {
        const granted = await requestPermissions()

        if (!granted) {
          alert('Please grant camera permission to use the barcode scanner.')
          return;
        }

        if (Capacitor.getPlatform() === 'android') {
          const { available} = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
          // console.log({available})

          if (!available) {
            await BarcodeScanner.installGoogleBarcodeScannerModule()
          }
        }

        scanQR()
      } else {
        alert('QR code scanner not supported.')
        return;
      }
    } catch (err) {
      alert('QR code scanner not supported.')
      return;
    }
  }

  const scanQR = async () => {
    setLoading(true)
    try {
      const { barcodes } = await BarcodeScanner.scan({
        formats: [BarcodeFormat.QrCode]
      });
  
      // console.log({barcodes})
  
      if (barcodes.length) {
        const code = barcodes[0].rawValue

        await DispenserAPI.registerDispenser(code)
      }
      setLoading(false)
      alert('Device successfully registered.')
      handleRefresh(null)
    } catch (err) {
      // alert(err)
      setLoading(false)
    }
  }

  const requestPermissions = async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    // console.log({camera})
    return camera === 'granted' || camera === 'limited';
  }

  const handleTestSpray = async () => {
    if (confirm("Are you sure you want to demo spray?")) {
      props.testSpray()
    }
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
          <IonTitle>Devices</IonTitle>
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
            {props.dispensers.map((dispenser: any, i) =>  {
              const found = devices.find(x => x.address == dispenser.dispenserId.macAddress)
              return (
                <IonCol size='6' key={i}>
                  <IonCard color="light" onClick={() => editDevice(dispenser)}>
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
                            <IonCardSubtitle style={{marginTop: '10px'}}>{dispenser.dispenserId.macAddress}</IonCardSubtitle><br />
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
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton>
            <IonIcon icon={add}onClick={() => setAddDevice(true)}></IonIcon>
          </IonFabButton>
        </IonFab>
        <IonAlert
        // trigger="present-alert"
        isOpen={isAddDevice}
        header="Add Device"
        // subHeader="A Sub Header Is Optional"
        message="Please scan QR code on the dispenser to register."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: () => {
              setAddDevice(false)
            }
          },
          {
            text: 'Proceed',
            role: 'confirm',
            handler: () => {
              setAddDevice(false)
              handleQR()
            }
          }
        ]}
        onWillDismiss={() => setAddDevice(false)}
      ></IonAlert>
        <IonModal 
        isOpen={isOpen}
        onWillDismiss={() => setIsOpen(false)}
        >
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setIsOpen(false)}>Cancel</IonButton>
              </IonButtons>
              <IonTitle className='ion-text-center'>Edit Device</IonTitle>
              <IonButtons slot="end">
                <IonButton strong={true} onClick={() => updateDevice()}>
                  Save
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
          <IonGrid>
            <IonRow>
              <IonCol>
              <IonItem>
              <IonInput
                label="Name" 
                placeholder="Name"
                onIonInput={(e) => setDispenserName(e.detail.value)}
                value={dispenserName}
                required
                className='ion-text-end'
              >
                
              </IonInput>
              
              </IonItem>
              </IonCol>
            </IonRow>
            { props.isConnected && dispenser && props.selectedDevice?.address == dispenser.dispenserId.macAddress &&
              <IonRow>
                <IonCol className='ion-margin-top'>
                  <IonButton expand='block' className="ion-margin-top" onClick={() => handleTestSpray()}>
                    Demo Spray
                  </IonButton>
                </IonCol>
              </IonRow>
            }
          </IonGrid>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Devices;
