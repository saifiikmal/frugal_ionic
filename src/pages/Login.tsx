import { 
  IonButton, 
  IonButtons, 
  IonCol, 
  IonContent, 
  IonGrid, 
  IonHeader, 
  IonLabel, 
  IonLoading, 
  IonPage, 
  IonRow, 
  IonTitle, 
  IonToolbar,
  IonIcon,
  IonItem,
  IonInput,
  IonAlert,
  IonNote
} from '@ionic/react';
import './Login.css';
import { useEffect, useRef, useState } from 'react';
import { eyeOutline, eyeOff, personCircle, eyeOffOutline } from 'ionicons/icons';
import {useHistory} from 'react-router-dom'
import { useAuth } from '../context/authContext'
import { Browser} from '@capacitor/browser'

const Login: React.FC = () => {
  const history = useHistory();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [iserror, setIserror] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const { loading, error, login } = useAuth();
  const handleLogin = async () => {

    if (username == "") {
      alert("Please enter your username");
      // setIserror(true);
      return;
    }
    if (!password || password.length < 6) {
        alert("Please enter your password");
        // setIserror(true);
        return;
    }

    await login(username, password)
  };

  const openRegister = async () => {
    await Browser.open({ 
      url: 'https://frugal.sirimsense.com/register',
      presentationStyle: 'popover' 
    });
  }

  const openForgot = async () => {
    await Browser.open({ 
      url: 'https://frugal.sirimsense.com/forgot',
      presentationStyle: 'popover' 
    });
  }


  return (
    <IonPage>
      <IonLoading isOpen={loading} />
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding ion-text-center">
        <IonGrid>
        
        <IonRow>
          <IonCol>
            <IonIcon
                style={{ fontSize: "70px", color: "#0040ff" }}
                icon={personCircle}
            />
          </IonCol>
        </IonRow>
          <IonRow>
            <IonCol>
            <IonItem className='ion-margin-top'>
            <IonInput
                label='Username'
                labelPlacement='floating'
                type="text"
                value={username}
                onIonInput={(e) => setUsername(e.detail.value!)}
                >
            </IonInput>
            </IonItem>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol>
            <IonItem>
              <IonInput
                label='Password'
                labelPlacement='floating'
                type={showPassword ? "text" : "password"}
                value={password}
                onIonInput={(e) => setPassword(e.detail.value!)}
                >
              </IonInput>
              <IonButton 
                slot='end' 
                fill="clear" 
                aria-label="Show/hide"
                onClick={() => setShowPassword(!showPassword)}
                >
                <IonIcon slot="icon-only" icon={showPassword ? eyeOutline : eyeOffOutline} aria-hidden="true"></IonIcon>
              </IonButton>
            </IonItem>
            <IonItem>
      </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
            {/* <p style={{ fontSize: "small" }}>
                  By clicking LOGIN you agree to our <a href="#">Policy</a>
              </p> */}
              <IonButton className="ion-margin-top" expand="block" onClick={handleLogin}>Login</IonButton>
              <p style={{ fontSize: "medium" }}>
                  Don't have an account? <a onClick={() => openRegister()}>Sign up!</a>
              </p>
              <p style={{ fontSize: "medium" }}>
                  Forgot password? <a onClick={() => openForgot()}>Click here</a>
              </p>

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;
