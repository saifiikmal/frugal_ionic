import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonContent,
  IonHeader,
  IonIcon,
  IonLabel,
  IonLoading,
  IonMenu,
  IonRouterOutlet,
  IonSplitPane,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle, list, home, settings } from 'ionicons/icons';
import Devices from './pages/Devices';
import Home from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';

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

import Main from './pages/Main';

import { useAuth } from './context/authContext'

setupIonicReact();

const App: React.FC = () => {
  const { loggedIn } = useAuth();
   
  return (
    <IonApp>
      { !loggedIn ? (
      <IonReactRouter>
          <Route exact path="/">
            <Login />
          </Route>
          <Route exact path="*">
            <Redirect to="/" />
          </Route>
      </IonReactRouter>
      )
      :
      (
      <IonReactRouter>
        {/* <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Route path="/">
              <Main />
            </Route>
          </IonRouterOutlet>
        </IonSplitPane> */}
        <IonRouterOutlet>
        <Route path="/">
          <Main />
        </Route>
      </IonRouterOutlet>
      </IonReactRouter>
      )
    }
    </IonApp>
  );
}

export default App;
