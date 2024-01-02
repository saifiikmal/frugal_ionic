import React, { useEffect, useState, useRef } from 'react'
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
  IonIcon,
  IonList,
  IonText,
  IonNote,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonFab,
  IonFabButton,
  IonModal,
  IonDatetimeButton,
  IonDatetime,
  IonCheckbox,
  IonLoading
} from '@ionic/react'
import { BluetoothDevice, DeviceData, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC } from '../types/device';
import { qrCode, trash, pencil, add } from 'ionicons/icons'
import { BarcodeFormat, BarcodeScanner} from '@capacitor-mlkit/barcode-scanning'
import moment from 'moment'
import DispenserAPI from '../api/dispenser'
import CanisterAPI from '../api/canister'
import './Schedule.css'
import { OverlayEventDetail } from '@ionic/react/dist/types/components/react-component-lib/interfaces';
// import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial';
import { BleClient, dataViewToText, textToDataView } from '@capacitor-community/bluetooth-le';

interface ScheduleProps {
  isConnected: boolean,
  selectedDevice: BluetoothDevice | null,
  dispenser: any,
  onConnected(device: BluetoothDevice | null): any,
  onSelectDevice: any,
  onSetLoading(val: boolean): any,
}

const Schedule: React.FC<{
  isConnected: boolean,
  selectedDevice: BluetoothDevice | null,
  dispenser: any,
  onConnected(device: BluetoothDevice | null): any,
  onSelectDevice: any,
  onSetLoading(val: boolean): any,
}> = (props: ScheduleProps) => {

  const [dispenserTime, setDispenserTime] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [action, setAction] = useState<string | null>(null)

  const prevDispenser = useRef<any>()

  // const [message, setMessage] = useState(
  //   'This modal example uses triggers to automatically open a modal when the button is clicked.'
  // );

  useEffect(() => {
    
    if (prevDispenser.current) {
      if (prevDispenser.current.dispenser != props.dispenser) {
        // console.log('props dispenser changed')
        // console.log('prev: ', prevDispenser.current.dispenser)
        // console.log('next: ', props.dispenser)

        syncTimer()
      }
    }
    
    prevDispenser.current = { dispenser: props.dispenser }

  })

  const syncDevice = async () => {
    if (props.selectedDevice && props.isConnected) {
      await syncTimer()
    } else {
      alert("Please select the device & connect first.")
    }
  }

  async function handleRefresh(event: CustomEvent<RefresherEventDetail> | null) {
    event == null ? setLoading(true) : null

    // if (props.isConnected) await syncTimer()

    setTimeout(() => {
      // Any calls to load data go here
      props.onSelectDevice()
      event ? event.detail.complete() : setLoading(false)
    }, 2000);
  }

  const submitTime = async (action: string | null) => {
    try {
      if (dispenserTime) {
        console.log({dispenserTime})

        if (dispenserTime.dispenseAmount == null || dispenserTime.dispenseAmount <= 0) {
          alert("Amount must be more than zero");
          return;
        }
        if (action == 'edit') {
          const resp = await DispenserAPI.updateDispenserTime(dispenserTime.id, dispenserTime)

          // console.log({resp})
        } else {
          const resp = await DispenserAPI.createDispenserTime(dispenserTime)

          // console.log({resp})
        }

      }
      setIsOpen(false)
      handleRefresh(null)
    } catch (err) {
      console.log(err)
    }
   
  }

  const editDispenserTime = (time: any) => {
    setAction('edit')
    setDispenserTime(time)
    setIsOpen(true)
  }

  const addDispenserTime = () => {
    setAction('add')
    setDispenserTime({
      dispenserId: props.dispenser.dispenserId.id,
      timerTime: '00:00'
    })
    setIsOpen(true)
  }

  const deleteDispenserTime = async (id: any) => {
    try {
      if (confirm('Are you sure you want to delete this?')) {
        const resp = await DispenserAPI.deleteDispenserTime(id)
        handleRefresh(null)
      }
    } catch (err) {
      console.log(err)
    }
  }

  const onChange = (field: string, val: any) => {
    console.log('select: ', field, val)
    const newTime = {
      ...dispenserTime,
      [field]: val
    }
    console.log({newTime})
    setDispenserTime(newTime)
    // console.log({newTime})
  }

  const syncTimer = async () => {

    if (props.selectedDevice && props.isConnected) {
      // let timers = []

      let timerJson: any = []
      for(let i = 0; i < 7; i++) {
        timerJson[i] = []
      }

      console.log("dispensetimer: ", props.dispenser.dispensertimes)
      for (let val of props.dispenser.dispensertimes) {
        if (val.timerType == 'daily') {
          for(let i = 0; i < 7; i++) {
            timerJson[i].push({
              time: val.timerTime,
              dispense: val.dispenseAmount
            })
          }
        } else {
          if (val.sunday) {
            timerJson[0].push({
              time: val.timerTime,
              dispense: val.dispenseAmount
            })
          }
          if (val.monday) {
            timerJson[1].push({
              time: val.timerTime,
              dispense: val.dispenseAmount
            })
          }
          if (val.tuesday) {
            timerJson[2].push({
              time: val.timerTime,
              dispense: val.dispenseAmount
            })
          }
          if (val.wednesday) {
            timerJson[3].push({
              time: val.timerTime,
              dispense: val.dispenseAmount
            })
          }
          if (val.thursday) {
            timerJson[4].push({
              time: val.timerTime,
              dispense: val.dispenseAmount
            })
          }
          if (val.friday) {
            timerJson[5].push({
              time: val.timerTime,
              dispense: val.dispenseAmount
            })
          }
          if (val.saturday) {
            timerJson[6].push({
              time: val.timerTime,
              dispense: val.dispenseAmount
            })
          }
        }
        // const vType = val.timerType == 'weekly' ? 'W' : 'D'
        // const vTime = val.timerTime
        // const vAmount = String(val.dispenseAmount).padStart(3, '0')
        // const sunday = val.sunday ? 1 : 0
        // const monday = val.monday ? 1 : 0
        // const tuesday = val.tuesday ? 1 : 0
        // const wednesday = val.wednesday ? 1 : 0
        // const thursday = val.thursday ? 1 : 0
        // const friday = val.friday ? 1 : 0
        // const saturday = val.saturday ? 1 : 0

        // timers.push(`${vType},${vTime},${vAmount},${sunday},${monday},${tuesday},${wednesday},${thursday},${friday},${saturday}`)
      }
      let jsonData = {
        time: moment().format("YYYY-MM-DD HH:mm:ss"),
        spray: 1,
        settings: timerJson
      }
      console.log({jsonData})
      if (timerJson.length > 0) {
        const timerData = `TIMER:${JSON.stringify(jsonData)}#`
        console.log("dataview timer: ", timerData.length, textToDataView(timerData))

        for (let i=0; i < timerData.length; i+= 500) {
          const cutData = timerData.substr(i, 500)
          console.log("timerdata: ", cutData)
          await BleClient.write(props.selectedDevice.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView(cutData))
        }

        // await BluetoothSerial.write(`TIMER:${timers.join('|')}`)
        props.onSetLoading(true)
      } else {
        alert('Nothing to sync')
      }
    }
  }

  return (
    <IonPage>
      <IonLoading isOpen={loading} />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Schedule</IonTitle>
          <IonButtons slot='start'>
            <IonMenuButton></IonMenuButton>
          </IonButtons>
          <IonButtons slot="end" style={{ marginRight: '15px'}}>
            <IonButton fill="solid" color={'primary'} onClick={syncDevice}>
              Sync
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        { props.isConnected && props.selectedDevice && props.dispenser && 
        <>
        <IonList>
          { props.dispenser.dispensertimes.map((times: any) => {
              let arrWeekly = []
              if (times.timerType === 'weekly') {
                if (times.sunday) arrWeekly.push('Sunday')
                if (times.monday) arrWeekly.push('Monday')
                if (times.tuesday) arrWeekly.push('Tuesday')
                if (times.wednesday) arrWeekly.push('Wednesday')
                if (times.thursday) arrWeekly.push('Thursday')
                if (times.friday) arrWeekly.push('Friday')
                if (times.saturday) arrWeekly.push('Saturday')
              }

              let timerTime = moment(times.timerTime, 'HH:mm').format('hh:mm A')
              return (
                <IonItemSliding key={times.id}>
                <IonItem button={true} detail={false} onClick={() => editDispenserTime(times)}>
                  <div className="unread-indicator-wrapper" slot="start">
                    { times.timerType === 'daily' ? <div className="daily-indicator">D</div> :
                      <div className="weekly-indicator">W</div>
                    }
                  </div>
                  <IonLabel className="ion-align-items-center" style={{display: 'flex'}}>
                    <strong>{timerTime} - {times.timerType === 'daily' ? 'Daily' : `Every ${arrWeekly.join(', ')}`}</strong>
                    <br />
                  </IonLabel>
                  <div slot="end">
                    <IonNote color="medium">{times.dispenseAmount}</IonNote>
                  </div>
                </IonItem>
                <IonItemOptions side="end">
                  <IonItemOption color="danger">
                    <IonIcon slot="icon-only" icon={trash} onClick={() => deleteDispenserTime(times.id)}></IonIcon>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
                )
              }
            )
          }
        </IonList>
        
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton>
            <IonIcon icon={add} onClick={() => addDispenserTime()}></IonIcon>
          </IonFabButton>
        </IonFab>
        </>
        }
        <IonModal isOpen={isOpen}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setIsOpen(false)}>Cancel</IonButton>
              </IonButtons>
              <IonTitle className='ion-text-center'>{ action == 'edit' ? 'Edit' : 'Add' }</IonTitle>
              <IonButtons slot="end">
                <IonButton strong={true} onClick={() => submitTime(action)}>
                  Confirm
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonItem className='ion-margin-top'>
                  <IonSelect 
                    label="Frequency" 
                    placeholder="Daily/Weekly"
                    onIonChange={(e) => onChange('timerType', e.detail.value)}
                    value={dispenserTime != null && dispenserTime.timerType ? dispenserTime.timerType : null}
                  >
                    <IonSelectOption value="daily">Daily</IonSelectOption>
                    <IonSelectOption value="weekly">Weekly</IonSelectOption>
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonItem>
                  <IonLabel>Time</IonLabel>
                  <IonDatetimeButton datetime="timerTime"></IonDatetimeButton>

                  <IonModal keepContentsMounted={true}>
                    <IonDatetime 
                      id="timerTime" 
                      presentation='time'
                      onIonChange={e => onChange('timerTime', e.detail.value)}
                      value={dispenserTime != null && dispenserTime.timerTime ? dispenserTime.timerTime : null}
                    >
                    </IonDatetime>
                  </IonModal>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
              <IonItem>
              <IonInput 
                label="Dispense amount" 
                type='number'
                placeholder="Amount"
                onIonChange={(e) => onChange('dispenseAmount',e.detail.value)}
                value={dispenserTime != null && dispenserTime.dispenseAmount ? dispenserTime.dispenseAmount : null}
                required
                inputMode='numeric'
                className='ion-text-end'
              >
                
              </IonInput>
              
              </IonItem>
              </IonCol>
            </IonRow>
            { dispenserTime != null && dispenserTime.timerType === 'weekly' &&
              <>
              <IonRow>
                <IonCol>
                  <IonItem>
                    <IonCheckbox onIonChange={(e: any) => onChange('sunday', e.currentTarget != null ? e.currentTarget.checked : false)} checked={dispenserTime != null && dispenserTime.sunday ? true : false}>Sunday</IonCheckbox>
                  </IonItem>
                </IonCol>
                <IonCol>
                  <IonItem>
                    <IonCheckbox onIonChange={(e: any) => onChange('monday', e.currentTarget != null ? e.currentTarget.checked : false)} checked={dispenserTime != null && dispenserTime.monday ? true : false}>Monday</IonCheckbox>
                  </IonItem>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonItem>
                    <IonCheckbox onIonChange={(e: any) => onChange('tuesday', e.currentTarget != null ? e.currentTarget.checked : false)} checked={dispenserTime != null && dispenserTime.tuesday ? true : false}>Tuesday</IonCheckbox>
                  </IonItem>
                </IonCol>
                <IonCol>
                  <IonItem>
                    <IonCheckbox onIonChange={(e: any) => onChange('wednesday', e.currentTarget != null ? e.currentTarget.checked : false)} checked={dispenserTime != null && dispenserTime.wednesday ? true : false}>Wednesday</IonCheckbox>
                  </IonItem>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonItem>
                    <IonCheckbox onIonChange={(e: any) => onChange('thursday', e.currentTarget != null ? e.currentTarget.checked : false)} checked={dispenserTime != null && dispenserTime.thursday ? true : false}>Thursday</IonCheckbox>
                  </IonItem>
                </IonCol>
                <IonCol>
                  <IonItem>
                    <IonCheckbox onIonChange={(e: any) => onChange('friday', e.currentTarget != null ? e.currentTarget.checked : false)} checked={dispenserTime != null && dispenserTime.friday ? true : false}>Friday</IonCheckbox>
                  </IonItem>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <IonItem>
                    <IonCheckbox onIonChange={(e: any) => onChange('saturday', e.currentTarget != null ? e.currentTarget.checked : false)} checked={dispenserTime != null && dispenserTime.saturday ? true : false}>Saturday</IonCheckbox>
                  </IonItem>
                </IonCol>
                <IonCol>
                  
                </IonCol>
              </IonRow>
              </>
            }
          </IonGrid>
          </IonContent>
        </IonModal>
      
      { 
        props.selectedDevice && !props.dispenser  && 
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonLabel>Unregistered device. Please make sure you have registered the device.</IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
      }
      { 
        !props.selectedDevice  && 
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonLabel>Please select the device first.</IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
      }
      { 
        props.selectedDevice && !props.isConnected  && 
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonLabel>Please connect the device first.</IonLabel>
            </IonCol>
          </IonRow>
        </IonGrid>
      }
      </IonContent>
    </IonPage>
  )
}

export default Schedule