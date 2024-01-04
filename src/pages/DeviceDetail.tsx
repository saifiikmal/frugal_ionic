import { 
  IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, 
  IonLabel, IonLoading, IonMenuButton, IonPage, IonRow, 
  IonTitle, IonToolbar, IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent,
  IonIcon, IonRouterOutlet
 } from '@ionic/react';
import './Main.css';

import { bulbOutline, logInOutline, informationOutline, calendarOutline, settingsOutline, logOutOutline } from 'ionicons/icons';
import { useAuth } from '../context/authContext'
import { RouteComponentProps } from 'react-router';

interface DeviceDetailProps
  extends RouteComponentProps<{
    id: string;
  }> {}

const DeviceDetail: React.FC<DeviceDetailProps> = ({ match }) => {
  
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>User Detail</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>User {match.params.id}</IonContent>
    </IonPage>
  )
}

export default DeviceDetail;