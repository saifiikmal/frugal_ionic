import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonLoading,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle, list, home, settings } from 'ionicons/icons';
import Devices from './pages/Devices';
import Home from './pages/Home';
import Settings from './pages/Settings';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions'
import { BluetoothSerial } from '@awesome-cordova-plugins/bluetooth-serial'
import { useEffect, useState } from 'react';

import { BluetoothDevice, DeviceProps, DeviceData } from './types'

setupIonicReact();

const App: React.FC = () => {
  const [devices, setDevices] = useState([]); 
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null)
  const [isConnected, setConnected] = useState(false)
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)

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

    checkPermissions()
    listDevices()
  }, [])

  useEffect(() => {
    if (isConnected) {
      const interval = setInterval(async () => {
        console.log('interval')
          const data = await BluetoothSerial.write("GET")
          // await BluetoothSerial.write("CLOCK")
          console.log("data: ", data)

      }, 30000)
      return () => clearInterval(interval);
    }
  }, [isConnected])

  const listDevices = async () => {
    const list = await BluetoothSerial.list();
    // console.log('list: ', list)
    setDevices(list)
    // console.log('devices: ', devices, list.length)
    

    BluetoothSerial.setDeviceDiscoveredListener().subscribe(
      (value) => {
        console.log('devices: ', value)
      }
    )

    BluetoothSerial.discoverUnpaired()
  }

  const onSelectDevice = (device: BluetoothDevice) => {
    console.log('parent select device: ', device)
    setSelectedDevice(device)
  }

  const onConnected = async () => {
    // disconnect
    setIsLoading(true)
    if (selectedDevice) {
      if (isConnected) {
        const dc =  await BluetoothSerial.disconnect()
        console.log('dc: ', dc)

        if (dc) {
          setConnected(false)
          setIsLoading(false)
        }
      } else {
        BluetoothSerial.connect(selectedDevice.id).subscribe(
          async (value) => {
            console.log('val: ', value)
            const isConn = await BluetoothSerial.isConnected()
             console.log('connected: ', isConn)

             if (isConn) {
              setConnected(true)

              await BluetoothSerial.write("GET")
              // await BluetoothSerial.write("CLOCK")

              BluetoothSerial.subscribe("\n").subscribe(
                (value) => {
                  if (value.startsWith("SET:")) {
                    onUpdateData()
                  }
                  if (value.startsWith("SYNC:")) {
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
                      currentTime,
                      startDate,
                      endDate,
                      interval,
                      nextInterval,
                      lastInterval,
                      counter,
                      status
                     ] = newValue.split(",")
                    console.log("id: ",id)
                    setDeviceData({
                      id,
                      currentTime,
                      startDate,
                      endDate,
                      interval,
                      nextInterval,
                      lastInterval,
                      counter,
                      status,
                    })
                  }
                }
              )
             }
          }
        )
      }
    }
  }

  const onUpdateData = async () => {
    console.log("update data")
    await BluetoothSerial.write("GET")
    setIsLoading(false)
  }
   
  return (
    <IonApp>
      <IonLoading isOpen={isLoading} />
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/devices">
              <Devices devices={devices} selectedDevice={selectedDevice} onSelectDevice={onSelectDevice} />
            </Route>
            <Route exact path="/home">
              <Home 
                selectedDevice={selectedDevice} 
                isConnected={isConnected} 
                onConnected={onConnected}
                deviceData={deviceData}
                onSetLoading={(val: boolean) => setIsLoading(val)}
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
              />
            </Route>
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
      </IonReactRouter>
    </IonApp>
  );
}

export default App;
