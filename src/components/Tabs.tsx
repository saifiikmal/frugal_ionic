import { 
  IonIcon,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import './Tabs.css';
import { useEffect, useRef, useState } from 'react';
import { ellipse, square, triangle, list, home, settings } from 'ionicons/icons';

import Devices from '../pages/Devices';
import Home from '../pages/Home';
import Settings from '../pages/Settings';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions'
// import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial'
import { BleClient, dataViewToText, textToDataView } from '@capacitor-community/bluetooth-le';

import { BluetoothDevice, DeviceProps, DeviceData, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC } from '../types/device'
import DispenserAPI from '../api/dispenser'
import CanisterAPI from '../api/canister'
import Register from '../pages/Register';
import Schedule from '../pages/Schedule';

import moment from 'moment'
import { ConnectionStatus, Network } from '@capacitor/network'

// import {  } from '@capacitor/app'

// App.han((error: any) => {
//   console.error('Unhandled error from native:', error);
//   // Handle the error or log it for debugging purposes
// });

const Tabs: React.FC = () => {
  const [devices, setDevices] = useState([]); 
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [isConnected, setConnected] = useState(false)
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [dispenser, setDispenser] = useState<any>(null)
  const [networkStatus, setNetworkStatus] = useState<boolean>(false);

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
    // listDevices()

  }, [])
  

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(async () => {
        // console.log('interval')
        try {
          // await BluetoothSerial.write("GET")
          if (selectedDevice) {
            await BleClient.write(selectedDevice.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView("GET#"))
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

  const onConnected = async (device: any) => {

    try {
      if (device) {
        setIsLoading(true)

        if (isConnected) {
          await BleClient.disconnect(device.address);
          console.log('disconnected from device', device);
          setIsLoading(false)
          setConnected(false)
        } else {
          await BleClient.connect(device.address, (deviceId) => {
            // console.log('onDisconnected: ', deviceId)
            setIsLoading(false)
            setConnected(false)
          });
          console.log('connected to device', device);

          setIsLoading(false)
          setConnected(true)


          await BleClient.startNotifications(
            device.address,
            FRUGAL_SERVICE,
            FRUGAL_CHARACTERISTIC,
            async (value) => {
              console.log("value: " + dataViewToText(value))
              let data = dataViewToText(value)

              if (data.startsWith("SET:")) {
                onUpdateData()
              }
              if (data.startsWith("SYNC:")) {
                onUpdateData()
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
                  setDeviceData(dd)

                  await syncDevice(dd)
                  
                  if (dispenser) {
                    DispenserAPI.updateDispenser(dispenser.dispenserId.id, {
                      lastSprayDate: moment.unix(dd.lastDispense).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
                    })
                  }
              }
            }
          );
          // await syncDevice()
          await BleClient.write(device.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView("GET#"))

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
    // disconnect
    // setIsLoading(true)
    // console.log({device})
    // try {
    //   if (device) {
    //     setIsLoading(true)

    //     if (isConnected) {
    //       const dc =  await BluetoothSerial.disconnect()
  
    //       if (dc) {
    //         setConnected(false)
    //         setIsLoading(false)
    //       }
    //     } else {
    //       const bt = await BluetoothSerial.connect(device.address)
          
    //       bt.subscribe(
    //         {
    //           error: (e) => {
    //             setIsLoading(false)
    //             setConnected(false)
    //             setSelectedDevice(null)
    //             setDispenser(null)
    //             alert("Please reconnect again")
    //           },
    //           next: async () => {
    //             const isConn = await BluetoothSerial.isConnected()
  
    //             if (isConn) {
    //               setConnected(true)
  
    //               await BluetoothSerial.write("GET")

    //               BluetoothSerial.subscribe("\n").subscribe(
    //                 {
    //                   error: (e) => {
    //                     setIsLoading(false)
    //                     setConnected(false)
    //                     alert("Something wrong. Please try again")
    //                   },
    //                   next: async (value) => {
    //                     if (value.startsWith("SET:")) {
    //                       onUpdateData()
    //                     }
    //                     if (value.startsWith("SYNC:")) {
    //                       onUpdateData()
    //                     }
    //                     if (value.startsWith("TIMER:")) {
    //                       onUpdateData()
    //                     }
    //                     if (value.startsWith("CLEAR:")) {
    //                       onUpdateData()
    //                     }
    //                     if (value.startsWith("CLOCK:")) {
    //                       console.log("CLOCK data: ", value.substring(6))
    //                     }

    //                     if (value.startsWith("GET:")) {
    //                       setIsLoading(false)
    //                       // console.log("GET data: ", value.substring(4))
    //                       let newValue = value.substring(4)
    
    //                       const [
    //                         id,
    //                         dispenserSno,
    //                         canisterSno,
    //                         currentTime,
    //                         sprayPressDuration,
    //                         pauseBetweenSpray,
    //                         lastDispense,
    //                         lastDispenseCounter,
    //                         counter,
    //                         dispenseLimit,
    //                         status,
    //                         isSync,
    //                       ] = newValue.replace(/(\r\n|\n|\r)/gm, "").split(",")

    //                       setDeviceData({
    //                         id,
    //                         dispenserSno,
    //                         canisterSno,
    //                         currentTime,
    //                         sprayPressDuration,
    //                         pauseBetweenSpray,
    //                         lastDispense,
    //                         lastDispenseCounter,
    //                         counter,
    //                         dispenseLimit,
    //                         status,
    //                         isSync,
    //                       })

    //                       if (dispenser) {
    //                         const dispLimit = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.initialSprays : ""

    //                         if (Number(isSync) == 0) {
    //                           const unixDate = moment().unix()
    //                           const canisterSno = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.serialNumber : ""
    //                           const dispenserSno = dispenser.dispenserId.serialNumber ? dispenser.dispenserId.serialNumber : ""

    //                           // console.log({dispLimit})

    //                           await BluetoothSerial.write(`SYNC:${unixDate},${dispenserSno},${canisterSno},${dispLimit}`)
    //                         } else {
    //                           if (dispenser.latestcanister.length > 0) {
    //                             await CanisterAPI.updateCanister(dispenser.latestcanister[0].canisterId.id, {
    //                               remainingSprays: dispLimit - counter
    //                             })
    //                           }
    //                         }
    //                       }
    //                     }
    //                   },
                      
    //                 }
    //               )
    //             } else {
                  
    //             }
    //           }
    //         }
    //       )
    //     }
    //   }
    // } 
    // catch (err) {
    //   // console.log({err})
    //   alert(err)
    //   setIsLoading(false)
    //   setConnected(false)
    // }
  }

  const onUpdateData = async () => {
    console.log("update data")
    // await BluetoothSerial.write("GET")
    if (selectedDevice) {
      await BleClient.write(selectedDevice.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView("GET#"))
    }
    setIsLoading(false)
  }

  const syncDevice = async (devData: any) => {
    if (dispenser && devData && selectedDevice) {
      const dispLimit = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.initialSprays : ""

      const currentDate = moment().format("YYYY-MM-DD HH:mm:ss")
      const canisterSno = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.serialNumber : ""
      const dispenserSno = dispenser.dispenserId.serialNumber ? dispenser.dispenserId.serialNumber : ""

      console.log({
        isSync: Number(devData.isSync),
        canisterSno,
        dispenserSno
      })
      if (canisterSno != "" && dispenserSno != "") {
        // console.log({dispLimit})

        const jsonData = {
          time: currentDate,
          dispenser: dispenserSno,
          canister: canisterSno,
          dispense_limit: dispLimit
        }

        const syncData = `SYNC:${JSON.stringify(jsonData)}#`
        await BleClient.write(selectedDevice.address, FRUGAL_SERVICE, FRUGAL_CHARACTERISTIC, textToDataView(syncData))
        // await BluetoothSerial.write(`SYNC:${unixDate},${dispenserSno},${canisterSno},${dispLimit}`)
      }

      if (Number(devData.isSync) == 0) {
        
        
      } else {
        if (dispenser.latestcanister.length > 0) {
          await CanisterAPI.updateCanister(dispenser.latestcanister[0].canisterId.id, {
            remainingSprays: dispLimit - Number(devData.counter)
          })
        }
      }
    }
  }

  // const handleLoading = async (val: boolean) => {
  //   setIsLoading(val)

  //   setTimeout(async () => {
  //     console.log({isLoading})
  //     try {
  //       // const btConnected = await BluetoothSerial.isConnected()
  //       // console.log({btConnected})
  //       if (isLoading) {
  //         setIsLoading(false)
  //         alert("Something wrong. Please try again")
  //       }
  //     } catch (err) {
  //       setIsLoading(false)
  //       alert("Something wrong. Please try again")
  //     }
      
  //   }, 20000)
  // }
  return (
    <>
      <IonLoading isOpen={isLoading} />
      <IonTabs>
      <IonRouterOutlet>
        <Route exact path="/devices">
          <Devices 
            devices={devices} 
            selectedDevice={selectedDevice} 
            onSelectDevice={onSelectDevice} 
          />
        </Route>
        <Route exact path="/home">
          <Home 
            selectedDevice={selectedDevice} 
            isConnected={isConnected} 
            onConnected={onConnected}
            deviceData={deviceData}
            onSetLoading={(val: boolean) => setIsLoading(val)}
            dispenser={dispenser}
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
        <Route path="/register">
          <Register 
            selectedDevice={selectedDevice}
            dispenser={dispenser} 
            isConnected={isConnected}
            onSetLoading={(val: boolean) => setIsLoading(val)}
            onSelectDevice={getDispenseData} 
          />
        </Route>
        <Route path="/schedule">
          <Schedule 
            isConnected={isConnected} 
            onConnected={onConnected}
            selectedDevice={selectedDevice}
            dispenser={dispenser} 
            onSelectDevice={getDispenseData} 
            onSetLoading={(val: boolean) => setIsLoading(val)}
          />
        </Route>
        {/* <Route path="/login">
          <Login />
        </Route> */}
        <Route exact path="/">
          <Redirect to="/home" />
        </Route>
      </IonRouterOutlet>
      <IonTabBar slot="bottom">
        <IonTabButton tab="devices" href="/devices">
          <IonIcon aria-hidden="true" icon={list} />
          <IonLabel>Devices</IonLabel>
        </IonTabButton>
        <IonTabButton tab="home" href="/home">
          <IonIcon aria-hidden="true" icon={home} />
          <IonLabel>Home</IonLabel>
        </IonTabButton>
        <IonTabButton tab="settings" href="/settings">
          <IonIcon aria-hidden="true" icon={settings} />
          <IonLabel>Settings</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
    </>
  )
}

export default Tabs;