import React, { useState } from 'react'
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonIcon
} from '@ionic/react'
import { BluetoothDevice, DeviceData } from '../types/device';
import { qrCode } from 'ionicons/icons'
import { BarcodeFormat, BarcodeScanner} from '@capacitor-mlkit/barcode-scanning'
import DispenserAPI from '../api/dispenser'
import CanisterAPI from '../api/canister'

interface RegisterProps {
  selectedDevice: BluetoothDevice | null,
  dispenser: any,
}

const Register: React.FC<{
  selectedDevice: BluetoothDevice | null,
  dispenser: any,
}> = (props: RegisterProps) => {
  const [regType, setRegType] = useState<string | null>(null)
  const [serialNo, setSerialNo] = useState<string | null>(null)
  const [supported, setSupported] = useState<boolean>(false)

  const onSelect = (e: any) => {
    console.log('select: ', e.detail.value)
    setRegType(e.detail.value)

    if (e.detail.value == 'canister') {
      if (props.selectedDevice) {
        if (!props.dispenser) {
          alert('Please register the device first')
          return;
        }
      } else {
        alert('Please select device first.')
        return;
      }
    } 
  }

  const handleQR = async () => {
    try {
      const { supported} = await BarcodeScanner.isSupported()
      console.log('qr: ', supported)
      setSupported(supported)

      if (supported) {
        const granted = await requestPermissions()

        if (!granted) {
          alert('Please grant camera permission to use the barcode scanner.')
          return;
        }

        const { available} = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable()
        console.log({available})

        if (!available) {
          await BarcodeScanner.installGoogleBarcodeScannerModule()
        }

        scanQR()
      } else {
        alert('QR code scanner not supported.')
        return;
      }
    } catch (err) {
      setSupported(false)
      alert('QR code scanner not supported.')
      return;
    }
  }

  const scanQR = async () => {
    const { barcodes } = await BarcodeScanner.scan({
      formats: [BarcodeFormat.QrCode]
    });

    console.log({barcodes})

    if (barcodes.length) {
      setSerialNo(barcodes[0].rawValue)
    }

  }

  const requestPermissions = async () => {
    const { camera } = await BarcodeScanner.requestPermissions();
    console.log({camera})
    return camera === 'granted' || camera === 'limited';
  }

  const handleSubmit = async () => {
    if (!regType) {
      alert('Please select registration type.')
      return;
    } else {
      if (regType == 'canister') {
        if (props.selectedDevice) {
          if (!props.dispenser) {
            alert('Please register the device first')
            return;
          }
        } else {
          alert('Please select device first.')
          return;
        }
      }
    }

    if (!serialNo) {
      alert('Please fill in serial number.')
      return;
    }

    try {
      if (regType == 'dispenser') {
        await DispenserAPI.registerDispenser(serialNo)
        alert('Succesfully registered dispenser')
        return;
      } else {
        await CanisterAPI.registerCanister(props.dispenser.dispenserId.id, serialNo)
        alert('Succesfully registered canister')
        return
      }
    } catch (err: any) {
      // alert(err.message)
      return;
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Register</IonTitle>
          <IonButtons slot='start'>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding ion-text-center">
        {/* <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Register</IonTitle>
          </IonToolbar>
        </IonHeader> */}
        <IonGrid>
          <IonRow>
            <IonCol>
            <IonItem className='ion-margin-top'>
            <IonSelect 
              label="Registration type" 
              placeholder="Dispenser/Canister"
              onIonChange={(e) => onSelect(e)}
              value={regType}
            >
              <IonSelectOption value="dispenser">Dispenser</IonSelectOption>
              <IonSelectOption value="canister">Canister</IonSelectOption>
            </IonSelect>
            
            </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
              <IonItem>
                <IonInput
                  label='Serial No.'
                  type="text"
                  value={serialNo}
                  onIonChange={(e) => setSerialNo(e.detail.value!)}
                  placeholder='Please type/scan QR code your serial no.'
                  className='ion-text-right'
                  
                ></IonInput>
                <IonIcon
                    className='ion-margin-start'
                    icon={qrCode}
                    onClick={() => handleQR()}
                />
              </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
              <IonButton className="ion-margin-top" expand="block" onClick={handleSubmit}>Submit</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default Register;