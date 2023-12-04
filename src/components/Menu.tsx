import { 
  IonContent,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonLoading,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { heartOutline, heartSharp, homeOutline, homeSharp, mailOutline, mailSharp, paperPlaneOutline, paperPlaneSharp, logOutOutline, trailSignOutline, trailSignSharp, calendarOutline, calendarSharp} from 'ionicons/icons';

import './Menu.css';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../context/authContext'

interface AppPage {
  url: string;
  iosIcon: string;
  mdIcon: string;
  title: string;
}

const appPages: AppPage[] = [
  // {
  //   title: 'Home',
  //   url: '/home',
  //   iosIcon: homeOutline,
  //   mdIcon: homeSharp
  // },
  // {
  //   title: 'Devices',
  //   url: '/devices',
  //   iosIcon: paperPlaneOutline,
  //   mdIcon: paperPlaneSharp
  // },
  {
    title: 'Register',
    url: '/register',
    iosIcon: trailSignOutline,
    mdIcon: trailSignSharp
  },
  {
    title: 'Schedule',
    url: '/schedule',
    iosIcon: calendarOutline,
    mdIcon: calendarSharp
  },
  
];

const Menu: React.FC = () => {

  const { user, logout } = useAuth();

  const logOut = async () => {
    await logout()
  }

  return (
    <IonMenu type="push" contentId="main">
      {/* <IonHeader>
      <IonToolbar>
        <IonTitle>Frugal {import.meta.env.VITE_BASE_API_URL}</IonTitle>
      </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">This is the menu content.</IonContent> */}
      <IonContent>
        <IonList id="inbox-list">
          <IonListHeader>Frugal</IonListHeader>
          <IonNote className="ion-margin-top">{ user ? user.email : '' }</IonNote>
          {appPages.map((appPage, index) => {
            return (
              <IonMenuToggle key={index} autoHide={false}>
                <IonItem className={location.pathname === appPage.url ? 'selected' : ''} routerLink={appPage.url} routerDirection="none" lines="none" detail={false}>
                  <IonIcon slot="start" icon={appPage.iosIcon} />
                  <IonLabel>{appPage.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
          <IonMenuToggle key='logout' autoHide={false} onClick={() => logOut()}>
            <IonItem lines="none" detail={false}>
              <IonIcon slot="start" icon={logOutOutline} />
              <IonLabel>Log Out</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>

      </IonContent>
    </IonMenu>
  )
};

export default Menu;