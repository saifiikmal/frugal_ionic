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
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial'

import { BluetoothDevice, DeviceProps, DeviceData } from '../types/device'
import DispenserAPI from '../api/dispenser'
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
    console.log('componentDidMount');
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
    listDevices()

  }, [])
  

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(async () => {
        // console.log('interval')
        try {
          await BluetoothSerial.write("GET")
          // await BluetoothSerial.write("CLOCK")
          // console.log("data: ", data)
        } catch (err) {
          console.log({err})
          console.log("err 1")
          setIsLoading(false)
          setConnected(false)
        }
      }, 15000)

      const interval2 = setInterval(async () => {
        // Update the count state every second
        // console.log({isConnected})
          // console.log({isConnected})
          try {
            const btConnected = await BluetoothSerial.isConnected()
            // console.log({btConnected})
          } catch (err) {
            console.log({err})
            console.log("err 2")
            setIsLoading(false)
            setConnected(false)
          }
      }, 1000);
  
      // Clear the interval when the component unmounts
      return () => {
        clearInterval(interval)
        clearInterval(interval2)
      }
    }
  }, [isConnected])

  useEffect(() => {

    getDispenseData()
  }, [selectedDevice])

  useEffect(() => {
    if (dispenser && selectedDevice && !isConnected) {
      console.log("onConnected onselectdevice")
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

  const listDevices = async () => {
    const list = await BluetoothSerial.list();
    // console.log('list: ', list)
    setDevices(list)
    // console.log('devices: ', devices, list.length)
    

    BluetoothSerial.setDeviceDiscoveredListener().subscribe(
      (value) => {
        // console.log('devices: ', value)
      }
    )

    BluetoothSerial.discoverUnpaired()
  }

  const onSelectDevice = async (device: BluetoothDevice) => {
    console.log('parent select device: ', device)
    setSelectedDevice(device)

    // if (device) {
    //   try {
    //     const resp = await DispenserAPI.getDispenserByMacAddress(device.address)
      
    //     console.log(resp.data)

    //     setDispenser(resp.data)

    //     if (!isConnected) {
    //       console.log("onConnected onselectdevice")
    //       onConnected(device)
    //     }

    //   } catch (err) {
    //     // alert('Unregistered device. Please make sure you have registered the device.')
    //     setIsLoading(false)
    //     setConnected(false)
    //   }
    // }
  }

  const onConnected = async (device: any) => {
    // disconnect
    // setIsLoading(true)
    console.log({device})
    try {
      if (device) {
        setIsLoading(true)

        if (isConnected) {
          const dc =  await BluetoothSerial.disconnect()
          console.log('dc: ', dc)
  
          if (dc) {
            setConnected(false)
            setIsLoading(false)
          }
        } else {
          const bt = await BluetoothSerial.connect(device.address)
          
          console.log("connect")
          bt.subscribe(
            {
              error: (e) => {
                console.log("error1 :", e)
                setIsLoading(false)
                setConnected(false)
                setSelectedDevice(null)
                setDispenser(null)
                alert("Please reconnect again")
              },
              next: async () => {
                const isConn = await BluetoothSerial.isConnected()
                console.log('connected: ', isConn)
  
                if (isConn) {
                  setConnected(true)
  
                  await BluetoothSerial.write("GET")

                  BluetoothSerial.subscribe("\n").subscribe(
                    {
                      error: (e) => {
                        console.log("error2 :", e)
                        // throw Error(e)
                        setIsLoading(false)
                        setConnected(false)
                        alert("Something wrong. Please try again")
                      },
                      next: async (value) => {
                        // console.log("next: ", value)
                        if (value.startsWith("SET:")) {
                          onUpdateData()
                        }
                        if (value.startsWith("SYNC:")) {
                          onUpdateData()
                        }
                        if (value.startsWith("TIMER:")) {
                          onUpdateData()
                        }
                        if (value.startsWith("CLEAR:")) {
                          onUpdateData()
                        }
                        if (value.startsWith("CLOCK:")) {
                          console.log("CLOCK data: ", value.substring(6))
                        }

                        if (value.startsWith("GET:")) {
                          setIsLoading(false)
                          console.log("GET data: ", value.substring(4))
                          let newValue = value.substring(4)
    
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
                          console.log("id: ",id)
                          setDeviceData({
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
                          })
                          console.log({isSync, dispenser})
                          if (Number(isSync) == 0 && dispenser) {
                            const unixDate = moment().unix()
                            const canisterSno = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.serialNumber : ""
                            const dispenserSno = dispenser.dispenserId.serialNumber ? dispenser.dispenserId.serialNumber : ""
                            const dispLimit = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.initialSprays : ""

                            // console.log({dispLimit})

                            await BluetoothSerial.write(`SYNC:${unixDate},${dispenserSno},${canisterSno},${dispLimit}`)
                          }
                        }
                      },
                      // complete: ()  => {
                      //   console.log("complete: ")
                      //   setIsLoading(false)
                      // }
                    }
                  )
                } else {
                  
                }
              }
            }
          )
              // async (value) => {
              //   console.log('val: ', value)
              //   const isConn = await BluetoothSerial.isConnected()
              //   console.log('connected: ', isConn)
  
              //   if (isConn) {
              //     setConnected(true)
  
              //     await BluetoothSerial.write("GET")
              //     // await BluetoothSerial.write("CLOCK")
  
              //     BluetoothSerial.subscribe("\n").subscribe(
              //       {
              //         next: (v) => console.log(v),
              //         error: (e) => console.error(e),
              //         complete: () => console.info('complete') 
              //     }
              //       // async (value) => {
              //       //   if (value.startsWith("SET:")) {
              //       //     onUpdateData()
              //       //   }
              //       //   if (value.startsWith("SYNC:")) {
              //       //     onUpdateData()
              //       //   }
              //       //   if (value.startsWith("TIMER:")) {
              //       //     onUpdateData()
              //       //   }
              //       //   if (value.startsWith("CLEAR:")) {
              //       //     onUpdateData()
              //       //   }
              //       //   if (value.startsWith("CLOCK:")) {
              //       //     console.log("CLOCK data: ", value.substring(6))
              //       //   }
              //       //   if (value.startsWith("GET:")) {
              //       //     setIsLoading(false)
              //       //     console.log("GET data: ", value.substring(4))
              //       //     let newValue = value.substring(4)
  
              //       //     const [
              //       //       id,
              //       //       dispenserSno,
              //       //       canisterSno,
              //       //       currentTime,
              //       //       sprayPressDuration,
              //       //       pauseBetweenSpray,
              //       //       lastDispense,
              //       //       lastDispenseCounter,
              //       //       counter,
              //       //       status,
              //       //       isSync,
              //       //     ] = newValue.split(",")
              //       //     console.log("id: ",id)
              //       //     setDeviceData({
              //       //       id,
              //       //       dispenserSno,
              //       //       canisterSno,
              //       //       currentTime,
              //       //       sprayPressDuration,
              //       //       pauseBetweenSpray,
              //       //       lastDispense,
              //       //       lastDispenseCounter,
              //       //       counter,
              //       //       status,
              //       //       isSync,
              //       //     })
  
              //       //     if (isSync == 0 && dispenser) {
              //       //       const unixDate = moment().unix()
              //       //       const canisterSno = dispenser.latestcanister.length > 0 ? dispenser.latestcanister[0].canisterId.serialNumber : ""
              //       //       const dispenserSno = dispenser.dispenserId.serialNumber ? dispenser.dispenserId.serialNumber : ""
  
              //       //       await BluetoothSerial.write(`SYNC:${unixDate},${dispenserSno},${canisterSno}`)
              //       //     }
              //       //   }
              //       // },
              //       // (error) => {
              //       //   console.error('Subscription error:', error);
              //       //   setConnected(false)
              //       //   setIsLoading(false)
              //       //   alert("Something wrong. Please try again")
              //       // }
              //     )
              //   } else {
              //     setConnected(false)
              //     setIsLoading(false)
              //   }
              // },
              // (error) => {
              //   console.error('connect error:', error);
              //   setConnected(false)
              //   setIsLoading(false)
              //   alert("Something wrong. Please try again")
              // }
        }
      }
    } 
    catch (err) {
      // console.log({err})
      alert(err)
      setIsLoading(false)
      setConnected(false)
    }
  }

  const onUpdateData = async () => {
    console.log("update data")
    await BluetoothSerial.write("GET")
    setIsLoading(false)
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