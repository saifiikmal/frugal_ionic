import { 
  IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, 
  IonLabel, IonLoading, IonMenuButton, IonPage, IonRow, 
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent,
  IonIcon, IonRouterOutlet
 } from '@ionic/react';
 import { Redirect, Route, RouteComponentProps } from 'react-router-dom';
 import { IonReactRouter } from '@ionic/react-router';
import './Main.css';
import { useEffect, useRef, useState } from 'react';

import Devices from './Devices';
import Dashboard from './Dashboard';
import Settings from './Settings';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions'
// import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial'
import { BleClient, dataViewToText, textToDataView } from '@capacitor-community/bluetooth-le';

import { BluetoothDevice, DeviceProps, DeviceData, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC } from '../types/device'
import DispenserAPI from '../api/dispenser'
import CanisterAPI from '../api/canister'
import Register from './Register';
import Schedule from './Schedule';
import Home from './Home';

import moment from 'moment'
import { ConnectionStatus, Network } from '@capacitor/network'

import { bulbOutline, logInOutline, informationOutline, calendarOutline, settingsOutline, logOutOutline } from 'ionicons/icons';
import DeviceDetail from './DeviceDetail';
import ConnectDevice from './ConnectDevice';
import DashboardSelect from './DashboardSelect';
import ScheduleSelect from './ScheduleSelect';
import RegisterSelect from './RegisterSelect';

const Main: React.FC = () => {
  const [devices, setDevices] = useState<BluetoothDevice[]>([]); 
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [isConnected, setConnected] = useState(false)
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dispensers, setDispensers] = useState<any[]>([])
  const [dispenser, setDispenser] = useState<any>(null)
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);
  const [isProcessing, setProcessing]= useState<boolean>(false)

  const prevDispenser = useRef<any>()

  useEffect(() => {
    // console.log('componentDidMount');
    const checkPermissions = async () => {
      const permissions = [
        AndroidPermissions.PERMISSION.BLUETOOTH_CONNECT,
        AndroidPermissions.PERMISSION.BLUETOOTH_SCAN,
        AndroidPermissions.PERMISSION.ACCESS_FINE_LOCATION,
      ]

      for (let i = 0; i < permissions.length; i++) {
        const permission = await AndroidPermissions.checkPermission(permissions[i]);
        // console.log('permission: ', permissions[i])
        if (!permission.hasPermission) {
          await AndroidPermissions.requestPermission(permissions[i]);
        }
      }
      
    }

    const setupNetworkListener = () => {
      const networkHandler = (status: ConnectionStatus) => {
        setNetworkStatus(status.connected);
        console.log('Network status changed:', status);
        // Handle the network status change as needed
      };

      Network.addListener('networkStatusChange', networkHandler);

      // Return cleanup function to remove the listener
      // return () => {
      //   clear();
      // };
    };

    checkPermissions()
    setupNetworkListener()
    getDispensers()
    // listDevices()
    // console.log('main: ', props.match.path)
  }, [])

  useEffect(() => {
    
    if (prevDispenser.current) {
      if (prevDispenser.current.dispenser != dispenser
        || prevDispenser.current.isConnected != isConnected
        || prevDispenser.current.selectedDevice != selectedDevice
        ) {
        // if (prevDispenser.current.selectedDevice != selectedDevice) {
        //   getDispenseData()
        // }
        // console.log('props dispenser changed')
        // console.log('prev: ', prevDispenser.current.dispenser)
        // console.log('next: ', props.dispenser)
        if (!isProcessing && isConnected && selectedDevice 
          && selectedDevice.address === dispenser.dispenserId.macAddress
          && prevDispenser.current.dispenser != dispenser
          ) {
          syncTimer()
        }
      }
    }
    
    prevDispenser.current = { 
      dispenser: dispenser,
      isConnected: isConnected,
      selectedDevice: selectedDevice 
    }

  })
  

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(async () => {
        // console.log('interval')
        try {
          // await BluetoothSerial.write("GET")
          if (!isProcessing && selectedDevice) {
            // await BleClient.write(selectedDevice.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView("GET#"))
            // await syncDevice()
          }
          // await BluetoothSerial.write("CLOCK")
          // console.log("data: ", data)
        } catch (err) {
          console.log({err})
          setIsLoading(false)
          setConnected(false)
        }
      }, 15000)

      // const interval2 = setInterval(async () => {
      //   // Update the count state every second
      //   // console.log({isConnected})
      //     // console.log({isConnected})
      //     try {
      //       // const btConnected = await BluetoothSerial.isConnected()
      //       // console.log({btConnected})
      //     } catch (err) {
      //       console.log({err})
      //       setIsLoading(false)
      //       setConnected(false)
      //     }
      // }, 1000);
  
      // Clear the interval when the component unmounts
      return () => {
        clearInterval(interval)
        // clearInterval(interval2)
      }
    }
  }, [isConnected])

  useEffect(() => {

    getDispenseData()
  }, [selectedDevice])

  useEffect(() => {
    if (dispenser && selectedDevice && !isConnected) {
      onConnected(selectedDevice)
    }
    
  }, [dispenser])

  const getDispenseData = async () => {
    console.log({selectedDevice})
    if (selectedDevice) {
      try {
        const resp = await DispenserAPI.getDispenserByMacAddress(selectedDevice.address)
      
        console.log(resp.data)

        setDispenser(resp.data)
        setIsLoading(false)
        // if (!isConnected) {
        //   console.log("onConnected onselectdevice")
        //   onConnected(selectedDevice)
        // }

      } catch (err) {
        // alert('Unregistered device. Please make sure you have registered the device.')
        setIsLoading(false)
        setConnected(false)
      }
    }
  }

  const getDispensers = async () => {
    try {
      const resp = await DispenserAPI.getDispenserWithCanister({})
      setDispensers(resp.data.data)
      console.log({dispensers})
    } catch (err) {
      alert(err)
      return
    }
  }

  // const listDevices = async () => {
  //   const list = await BluetoothSerial.list();
  //   // console.log('list: ', list)
  //   setDevices(list)
  //   // console.log('devices: ', devices, list.length)
    

  //   BluetoothSerial.setDeviceDiscoveredListener().subscribe(
  //     (value) => {
  //       // console.log('devices: ', value)
  //     }
  //   )

  //   BluetoothSerial.discoverUnpaired()
  // }

  const onSelectDevice = async (device: BluetoothDevice) => {
    setSelectedDevice(device)
  }

  const onDisconnected = async (device: any) => {
    try {
      if (device) {
        setIsLoading(true)

        if (isConnected) {
          await BleClient.disconnect(device.id);
          console.log('disconnected from device', device);
          setSelectedDevice(null)
          setIsLoading(false)
          setConnected(false)
        }
      }
    } catch (err) {

    }
  }

  const onConnected = async (device: any) => {

    try {
      if (device) {
        setIsLoading(true)

        if (isConnected) {
          await BleClient.disconnect(device.id);
          console.log('disconnected from device', device);
          setSelectedDevice(null)
          setIsLoading(false)
          setConnected(false)
        } else {
          await BleClient.connect(device.id, (deviceId) => {
            // console.log('onDisconnected: ', deviceId)
            setIsLoading(false)
            setConnected(false)
            setSelectedDevice(null)
          });
          console.log('connected to device', device);

          setIsLoading(false)
          setConnected(true)


          await BleClient.startNotifications(
            device.id,
            FRUGAL_SERVICE,
            FRUGAL_CHARACTERISTIC,
            async (value) => {
              let data = dataViewToText(value)

              console.log("values: " + data)


              if (data.startsWith("SET:")) {
                onUpdateData()
              }
              if (data.startsWith("SYNC:")) {
                // console.log("syn")
                // onUpdateData()
                syncTimer()
              }
              if (data.startsWith("TIMER:")) {
                onUpdateData()
              }
              if (data.startsWith("CLEAR:")) {
                onUpdateData()
              }
              if (data.startsWith("CLOCK:")) {
                console.log("CLOCK data: ", data)
              }
              if (data.startsWith("GET:")) {
                  let newValue = data.substring(4)
                  const [
                    id,
                    dispenserSno,
                    canisterSno,
                    currentTime,
                    sprayPressDuration,
                    pauseBetweenSpray,
                    lastDispense,
                    lastDispenseCounter,
                    counter,
                    dispenseLimit,
                    status,
                    isSync,
                  ] = newValue.replace(/(\r\n|\n|\r)/gm, "").split(",")

                  const dd = {
                    id,
                    dispenserSno,
                    canisterSno,
                    currentTime: Number(currentTime),
                    sprayPressDuration: Number(sprayPressDuration),
                    pauseBetweenSpray: Number(pauseBetweenSpray),
                    lastDispense: Number(lastDispense),
                    lastDispenseCounter: Number(lastDispenseCounter),
                    counter: Number(counter),
                    dispenseLimit: Number(dispenseLimit),
                    status: Number(status),
                    isSync: Number(isSync),
                  }

                  // console.log({dd})
                  setDeviceData(dd)
                  setProcessing(false)

                  // await syncDevice(dd)
                  
                  if (dispenser) {
                    
                    DispenserAPI.updateDispenser(dispenser.dispenserId.id, {
                      lastSprayDate: moment.unix(dd.lastDispense).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]"),
                      // batteryLevel: Math.round((remainingSprays / dispLimit) * 100)
                    })

                    if (dispenser.latestcanister.length > 0) {

                      console.log('update get')
                      const dispLimit = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.initialSprays : 0
                      const remainingSprays = dispLimit - Number(counter)

                      

                      CanisterAPI.updateCanister(dispenser.latestcanister[0].canisterId.id, {
                        remainingSprays,

                      })
                    }
                  }

                  setTimeout(async () => {
                    await onUpdateData()
                  }, 15000)
              }
            }
          );
          await syncDevice()

          // setTimeout(async () => {
          //   await syncTimer()
          // }, 2000)
          // await BleClient.write(device.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView("GET#"))

          // const result = await BleClient.read(device.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC)
          // console.log("result: ", dataViewToText(result))

        }
      } else {

      }
      
    } catch (err) {
      console.error(err)
      alert(err)
      setIsLoading(false)
      setConnected(false)
    }
    
  }

  const onUpdateData = async () => {
    // console.log("update data")
    // await BluetoothSerial.write("GET")
    // console.log({
    //   selectedDevice,
    //   isConnected
    // })
    if (!isProcessing && selectedDevice) {
      await BleClient.write(selectedDevice.id, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView("GET#"))
    }
    setIsLoading(false)
  }

  const syncDevice = async () => {
    if (!isProcessing && dispenser && selectedDevice) {
      const dispLimit = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.initialSprays : ""

      const currentDate = moment().format("YYYY-MM-DD HH:mm:ss")
      const canisterSno = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.serialNumber : ""
      const dispenserSno = dispenser.dispenserId.serialNumber ? dispenser.dispenserId.serialNumber : ""

      // console.log({
      //   isSync: Number(devData.isSync),
      //   canisterSno,
      //   dispenserSno
      // })
      if (canisterSno != "" && dispenserSno != "") {
        // console.log({dispLimit})

        const jsonData = {
          time: currentDate,
          dispenser: dispenserSno,
          canister: canisterSno,
          dispense_limit: dispLimit
        }
        // setProcessing(true)
        const syncData = `SYNC:${JSON.stringify(jsonData)}#`
        await BleClient.write(selectedDevice.id, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView(syncData))
      }

    }
  }

  const scanDevices = async () => {
      try {
        await BleClient.initialize();

        // const device = await BleClient.requestDevice({
        //   services: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"],
        // });

        // console.log("ble device: ", device)
        const list: BluetoothDevice[] = []

        await BleClient.requestLEScan(
          {
            // services: ["4fafc201-1fb5-459e-8fcc-c5c9c331914b"],
            namePrefix: 'FRUGAL'
          },
          (result) => {
            console.log('received new scan result', result);
            let deviceName = result.localName ? result.localName : result.device.name ? result.device.name : "Unknown"
            
            let parseDevice = deviceName.split(" ")
            deviceName = parseDevice[0]
            let macAddress = parseDevice[1]
            
            if (dispensers.length > 0) {
              const found = dispensers.find(x => macAddress == x.dispenserId.macAddress)
              if (found) {
                deviceName = found.dispenserId.name
              }
            } 
            list.push({
              id: result.device.deviceId,
              address: macAddress,
              name: deviceName
            })
          }
        );
        setTimeout(async () => {
          await BleClient.stopLEScan();
          console.log('stopped scanning');

          if (isConnected && selectedDevice) {
            list.push(selectedDevice)
          }
          setDevices(list)
        }, 3000);
      } catch (err) {
        console.error(err)
      }
  }

  const syncTimer = async () => {
    console.log('synctimer:')
    console.log({
      selectedDevice,
      isConnected,
      dispenser,
    })
    if (selectedDevice && dispenser.dispenserId.macAddress == selectedDevice.address) {
      // let timers = []

      let timerJson: any = []
      for(let i = 0; i < 7; i++) {
        timerJson[i] = []
      }

      console.log("dispensetimer: ", dispenser.dispensertimes)

      // custom timer
      // TIMER:{"time":"2024-02-11 13:29:00","spray":0,"mode":"custom","settings":[["time":"13:30","dispense":"5","time":"13:32","dispense":"6"]]}#

      // preset timer
      // TIMER:{"time":"2024-02-11 13:29:00","spray":0,"mode":"preset","startTime":"13:30","dispenseAmount":5,"interval":15}#
      
      let jsonData 
      if (dispenser.dispenserId.timerFormat === 'preset') {
        if (dispenser.dispensertimes.length > 1) {
            const dispTime = dispenser.dispensertimes
            const time1 = dispTime[0].timerTime
            const time2 = dispTime[1].timerTime

            const startTime = moment(time1, 'HH:mm')
            const endTime = moment(time2, 'HH:mm')
            const diffInMin = endTime.diff(startTime, 'minutes')
          jsonData = {
            mode: 'preset',
            time: moment().format("YYYY-MM-DD HH:mm:ss"),
            spray: 0,
            startTime: dispTime[0].timerTime,
            dispenseAmount: dispTime[0].dispenseAmount,
            interval: diffInMin
          }
        }
      } else {
        for (let val of dispenser.dispensertimes) {
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
        jsonData = {
          mode: 'custom',
          time: moment().format("YYYY-MM-DD HH:mm:ss"),
          spray: 0,
          settings: timerJson
         }
      }

      // let jsonData = {
      //   time: moment().format("YYYY-MM-DD HH:mm:ss"),
      //   spray: 0,
      //   settings: timerJson
      // }
      console.log({jsonData})
      if (dispenser.dispensertimes.length > 0) {
        const timerData = `TIMER:${JSON.stringify(jsonData)}#`
        console.log("dataview timer: ", timerData.length, textToDataView(timerData))

        for (let i=0; i < timerData.length; i+= 500) {
          const cutData = timerData.substr(i, 500)
          console.log("timerdata: ", cutData)
          await BleClient.write(selectedDevice.id, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView(cutData))
        }

        // await BluetoothSerial.write(`TIMER:${timers.join('|')}`)
        // props.onSetLoading(true)
      } else {
        // alert('Nothing to sync')
      }
    }
  }

  const testSpray = async () => {
    if (selectedDevice) {
      BleClient.write(selectedDevice.id, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView("DEMO#"))
    }
  }
  return (
    <IonPage>
      <IonRouterOutlet>
      <Route exact path="/home">
          <Home 
            isConnected={isConnected}
            selectedDevice={selectedDevice}
            onDisconnected={onDisconnected}
          />
        </Route>
        <Route exact path="/devices">
          <Devices 
            devices={devices} 
            selectedDevice={selectedDevice} 
            onSelectDevice={onSelectDevice} 
            dispensers={dispensers}
            onGetDispensers={getDispensers}
            isConnected={isConnected}
            testSpray={testSpray}
          />
        </Route>
        <Route exact path="/devices/:id" component={DeviceDetail}/>
        <Route exact path="/dashboard">
          <DashboardSelect
            devices={devices} 
            selectedDevice={selectedDevice} 
            onSelectDevice={onSelectDevice} 
            dispensers={dispensers}
            onGetDispensers={getDispensers}
            isConnected={isConnected}
          />
        </Route>
        <Route exact path="/dashboard/:id" component={Dashboard} />
        <Route exact path="/connect">
          <ConnectDevice 
            selectedDevice={selectedDevice}
            devices={devices}
            dispensers={dispensers}
            isConnected={isConnected} 
            onConnected={onConnected}
            onDisconnected={onDisconnected}
            onSetLoading={(val: boolean) => setIsLoading(val)}
            onSelectDevice={onSelectDevice}
            onScanDevices={scanDevices}
          />
        </Route>
        <Route path="/settings">
          <Settings 
            selectedDevice={selectedDevice} 
            isConnected={isConnected} 
            onConnected={onConnected}
            deviceData={deviceData}
            onUpdateData={onUpdateData}
            onSetLoading={(val: boolean) => setIsLoading(val)}
            dispenser={dispenser}
          />
        </Route>
        <Route exact path="/register">
          <RegisterSelect
            devices={devices} 
            selectedDevice={selectedDevice} 
            onSelectDevice={onSelectDevice} 
            dispensers={dispensers}
            onGetDispensers={getDispensers}
            isConnected={isConnected}
          />
        </Route>
        <Route exact path="/schedule">
          {/* <Schedule 
            isConnected={isConnected} 
            onConnected={onConnected}
            selectedDevice={selectedDevice}
            dispenser={dispenser} 
            onSelectDevice={getDispenseData} 
            onSetLoading={(val: boolean) => setIsLoading(val)}
          /> */}
          <ScheduleSelect
            devices={devices} 
            selectedDevice={selectedDevice} 
            onSelectDevice={onSelectDevice} 
            dispensers={dispensers}
            onGetDispensers={getDispensers}
            isConnected={isConnected}
          />
        </Route>
        <Route exact path="/schedule/:id" render={(props) => <Schedule 
            {...props}
            isConnected={isConnected} 
            onConnected={onConnected}
            isProcessing={isProcessing}
            selectedDevice={selectedDevice}
            onSelectDevice={getDispenseData}
            // dispenser={dispenser} 
            // onSelectDevice={getDispenseData} 
            // onSetLoading={(val: boolean) => setIsLoading(val)}
          />} />
        {/* <Route path="/login">
          <Login />
        </Route> */}
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
       </IonRouterOutlet>
    </IonPage>
  )
}

export default Main;