import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Button, Image, StyleSheet, Text, View } from 'react-native';
import {ViewModel} from './viewmodel/ViewModel';


export default function App() {
  const [loading, setLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState(null); 
  const [textToShow, setTextToShow] = useState("Caricamento...");
  const [menuData, setMenuData] = useState(null);
  //const logicViewModel = new ViewModel();

  init = async () => {
    try {
      const logicViewModel = new ViewModel();
      await logicViewModel.initializeApp();
      setSessionUser(logicViewModel);
      //console.log("Session User", sessionUser); 
      //continua ancora a stampare null, nonostante sia stato settato, perchè è async e non è ancora stato completato
      //se invece lo uso esternamente a init, funziona, in quanto è stato completato
      setLoading(false); 
    } catch (err) {
      console.error("Errore di inizializzazione ", err);
      setLoading(false);
    }
  }

  fetchMenuDetails = async () => {
    try {
      const menuDetails = await sessionUser.fetchMenuData(49);
      setMenuData(menuDetails)
    } catch (err) {
      console.error("Erroe nel caricamento Menu Data:", err);
    }
  }

  useEffect(() => { 
    initializeAndFetch = async () => {
      if (!sessionUser) {
        await init(); //viene eseguito solo quando sessionUser è null
      } 
      if (sessionUser) {
        //console.log("useEffect info:", sessionUser);
        //await sessionUser.info(); //ora posso richimare i metodi della classe ViewModel con sessionUser
        await fetchMenuDetails();
      }
    };
    initializeAndFetch();
  }, [sessionUser]);

  if (loading) { 
    return (
      <View style={styles.container}>
        <Text>{textToShow}</Text>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  if (sessionUser && sessionUser.firstRun) {
    return (
      <View style={styles.container}>
        <Text>Primo avvio completato.</Text>
        <StatusBar style="auto" />
      </View>
    );
  } else if (sessionUser && !sessionUser.firstRun && menuData) {
    return (
      <View style={styles.container}>
        <Text>Secondo avvio.</Text>
        <Text>{sessionUser.sid}</Text>
        <Text>{sessionUser.uid}</Text>
        <Text>{JSON.stringify(sessionUser.firstRun)}</Text>
        
        <View style={{height:15, borderBottomWidth:2, borderColor:'black'}}/>

        <Text>Nome: {menuData?.name}</Text>
        <Text>Mid: {menuData.mid}</Text>
        <Text>{menuData.shortDescription}</Text>
        <Text>{menuData.deliveryTime}</Text>
        <Text>{menuData.longDescription}</Text>
       
        <Image source={{ uri: menuData.image }} style={styles.image}></Image>
        <StatusBar style="auto" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
  }
});
