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
} from '@ionic/react';
import './Login.css';
import { useEffect, useRef, useState } from 'react';
import { personCircle } from 'ionicons/icons';
import {useHistory} from 'react-router-dom'
import { useAuth } from '../context/authContext'

const Login: React.FC = () => {
  const history = useHistory();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [iserror, setIserror] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const { loading, error, login } = useAuth();
  const handleLogin = async () => {

    if (!password || password.length < 6) {
        setMessage("Please enter your password");
        setIserror(true);
        return;
    }

    await login(username, password)
  };


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
                onIonChange={(e) => setUsername(e.detail.value!)}
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
                type="password"
                value={password}
                onIonChange={(e) => setPassword(e.detail.value!)}
                >
              </IonInput>
            </IonItem>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol>
            {/* <p style={{ fontSize: "small" }}>
                  By clicking LOGIN you agree to our <a href="#">Policy</a>
              </p> */}
              <IonButton className="ion-margin-top" expand="block" onClick={handleLogin}>Login</IonButton>
              {/* <p style={{ fontSize: "medium" }}>
                  Don't have an account? <a href="#">Sign up!</a>
              </p> */}

            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;
