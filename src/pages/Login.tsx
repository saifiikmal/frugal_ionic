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
import moment from 'moment';
import { personCircle } from 'ionicons/icons';
import {useHistory} from 'react-router-dom'
import { useAuth } from '../context/authContext'

const Login: React.FC = () => {
  const history = useHistory();
  const [username, setUsername] = useState<string>("eve.holt@reqres.in");
  const [password, setPassword] = useState<string>("cityslicka");
  const [iserror, setIserror] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const { loading, error, login } = useAuth();
  const handleLogin = async () => {
    // if (!email) {
    //     setMessage("Please enter a valid email");
    //     setIserror(true);
    //     return;
    // }
    // if (validateEmail(email) === false) {
    //     setMessage("Your email is invalid");
    //     setIserror(true);
    //     return;
    // }

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
        {/* <IonRow>
          <IonCol>
            <IonAlert
                isOpen={error != null}
                onDidDismiss={() => setIserror(false)}
                cssClass="my-custom-class"
                header={"Error!"}
                message={error != null ? error : ''}
                buttons={["Dismiss"]}
            />
          </IonCol>
        </IonRow> */}
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
            {/* <IonLabel position="floating"> Username</IonLabel> */}
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
              {/* <IonLabel position="floating"> Password</IonLabel> */}
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
